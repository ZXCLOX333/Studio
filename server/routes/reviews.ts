import { RequestHandler } from "express";
import {
  ReviewsResponse,
  AddReviewRequest,
  AddReviewResponse,
} from "@shared/api";
import {
  GitHubConflictError,
  GitHubConfigError,
  fetchReviewsFromGitHub,
  mutateReviewsWithRetry,
  MAX_RETRIES,
} from "../services/githubReviews";

function handleError(res: Parameters<RequestHandler>[1], error: unknown) {
  if (error instanceof GitHubConflictError) {
    return res.status(409).json({
      error: "Conflict while updating reviews. Please retry shortly.",
    });
  }

  if (error instanceof GitHubConfigError) {
    console.error("GitHub configuration error:", error);
    return res.status(500).json({ error: error.message });
  }

  console.error("Unexpected reviews error:", error);
  return res.status(500).json({ error: "Unexpected reviews service error" });
}

// GET /api/reviews - Get all reviews
export const getReviews: RequestHandler = async (_req, res) => {
  try {
    const { reviews } = await fetchReviewsFromGitHub();
    const response: ReviewsResponse = { reviews };
    res.status(200).json(response);
  } catch (error) {
    handleError(res, error);
  }
};

// POST /api/reviews - Add new review with optimistic locking + retries
export const addReview: RequestHandler = async (req, res) => {
  const { text, avatar, stars }: AddReviewRequest = req.body ?? {};

  if (!text || typeof text !== "string" || text.trim().length === 0) {
    return res
      .status(400)
      .json({ error: "Text is required and cannot be empty" });
  }

  try {
    const review = await mutateReviewsWithRetry(
      (current) => {
        const newReview = {
          id:
            Date.now().toString() + Math.random().toString(36).substring(2, 11),
          text: text.trim(),
          createdAt: new Date().toISOString(),
          avatar:
            avatar ||
            "https://api.builder.io/api/v1/image/assets/TEMP/50539832474100cc93c13a30455d91939b986e3b?width=124",
          stars: stars || 5,
        };

        return {
          next: [...current, newReview],
          result: newReview,
        };
      },
      MAX_RETRIES
    );

    const response: AddReviewResponse = { review };
    res.status(201).json(response);
  } catch (error) {
    handleError(res, error);
  }
};

// DELETE /api/reviews - Clear all reviews with optimistic locking
export const clearReviews: RequestHandler = async (_req, res) => {
  try {
    await mutateReviewsWithRetry(
      () => ({
        next: [],
        result: undefined,
      }),
      MAX_RETRIES
    );
    res.status(200).json({ message: "All reviews cleared successfully" });
  } catch (error) {
    handleError(res, error);
  }
};
