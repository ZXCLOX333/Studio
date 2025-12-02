import { Buffer } from "node:buffer";
import type { BufferEncoding } from "node:buffer";
import { fetch } from "undici";
import { Review } from "@shared/api";

export class GitHubConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubConfigError";
  }
}

export class GitHubConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubConflictError";
  }
}

type GitHubContentResponse = {
  content: string;
  encoding: BufferEncoding;
  sha: string;
};

type GitHubUpdateResponse = {
  content?: { sha?: string };
  commit?: { sha?: string };
};

type ReviewsWithSha = {
  reviews: Review[];
  sha?: string;
};

const DEFAULT_MAX_RETRIES = 5;

function getMaxRetries(): number {
  const raw =
    process.env.GITHUB_MAX_RETRIES ??
    process.env.GITHUB_RETRY_LIMIT ??
    process.env.MAX_RETRIES;
  const parsed = raw ? Number(raw) : undefined;
  if (!parsed || Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_MAX_RETRIES;
  }
  return parsed;
}

const MAX_RETRIES = getMaxRetries();

function getConfig() {
  const token = process.env.GITHUB_TOKEN;
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const filePath = (process.env.GITHUB_FILE_PATH ?? "reviews.json").replace(
    /^\//,
    ""
  );
  const branch = process.env.GITHUB_BRANCH ?? "main";
  const commitMessage =
    process.env.GITHUB_COMMIT_MESSAGE ?? "chore: update reviews";
  const committerName = process.env.GIT_COMMITTER_NAME;
  const committerEmail = process.env.GIT_COMMITTER_EMAIL;

  if (!token) {
    throw new GitHubConfigError("Missing GITHUB_TOKEN environment variable");
  }
  if (!owner) {
    throw new GitHubConfigError("Missing GITHUB_OWNER environment variable");
  }
  if (!repo) {
    throw new GitHubConfigError("Missing GITHUB_REPO environment variable");
  }

  return {
    token,
    owner,
    repo,
    filePath,
    branch,
    commitMessage,
    committerName,
    committerEmail,
  };
}

function buildHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "User-Agent": "reviews-service",
  };
}

export async function fetchReviewsFromGitHub(): Promise<ReviewsWithSha> {
  const config = getConfig();
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}?ref=${config.branch}`;

  const response = await fetch(url, {
    headers: buildHeaders(config.token),
  });

  if (response.status === 404) {
    return { reviews: [], sha: undefined };
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Failed to fetch reviews from GitHub: ${response.status} ${body}`
    );
  }

  const payload = (await response.json()) as GitHubContentResponse;
  const buffer = Buffer.from(payload.content, payload.encoding ?? "base64");
  const rawContent = buffer.toString("utf-8").trim();

  if (!rawContent) {
    return { reviews: [], sha: payload.sha };
  }

  try {
    const parsed = JSON.parse(rawContent) as Review[];
    return { reviews: parsed, sha: payload.sha };
  } catch (error) {
    throw new Error(
      `reviews.json in GitHub repository contains invalid JSON: ${
        (error as Error).message
      }`
    );
  }
}

export async function persistReviewsToGitHub(
  reviews: Review[],
  sha?: string
): Promise<string | undefined> {
  const config = getConfig();
  const url = `https://api.github.com/repos/${config.owner}/${config.repo}/contents/${config.filePath}`;
  const headers = buildHeaders(config.token);

  const body: Record<string, unknown> = {
    message: config.commitMessage,
    content: Buffer.from(JSON.stringify(reviews, null, 2)).toString("base64"),
    branch: config.branch,
  };

  if (sha) {
    body.sha = sha;
  }

  if (config.committerName && config.committerEmail) {
    body.committer = {
      name: config.committerName,
      email: config.committerEmail,
    };
  }

  const response = await fetch(url, {
    method: "PUT",
    headers,
    body: JSON.stringify(body),
  });

  if (response.status === 409) {
    throw new GitHubConflictError("GitHub file changed during update");
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to persist reviews to GitHub: ${response.status} ${text}`
    );
  }

  const payload = (await response.json()) as GitHubUpdateResponse;
  return payload.content?.sha ?? payload.commit?.sha;
}

export async function mutateReviewsWithRetry<T>(
  mutator: (current: Review[]) => { next: Review[]; result: T },
  retries = MAX_RETRIES
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt < retries) {
    attempt += 1;
    const { reviews, sha } = await fetchReviewsFromGitHub();
    const snapshot = [...reviews];
    const { next, result } = mutator(snapshot);

    try {
      await persistReviewsToGitHub(next, sha);
      return result;
    } catch (error) {
      lastError = error;
      if (error instanceof GitHubConflictError && attempt < retries) {
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Exceeded retry attempts when updating reviews");
}

export { MAX_RETRIES };

