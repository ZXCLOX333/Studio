/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Review types
 */
export interface Review {
  id: string;
  text: string;
  createdAt: string;
  avatar?: string;
  stars?: number;
}

export interface ReviewsResponse {
  reviews: Review[];
}

export interface AddReviewRequest {
  text: string;
  avatar?: string;
  stars?: number;
}

export interface AddReviewResponse {
  review: Review;
}
