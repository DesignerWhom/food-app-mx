import { Router } from "express";
import {
  createReview,
  toggleReviewLike,
} from "../controllers/reviewController";

const router = Router();

router.post("/", createReview);

// NUEVA RUTA: POST /api/reviews/:reviewId/like
router.post("/:reviewId/like", toggleReviewLike);

export default router;
