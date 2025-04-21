import express from "express";
import { getHostelReviews, deleteReview, getReviewSummary, getReviews, submitReview } from "../controllers/reviewController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";
import { allowRoles } from "../middlewares/roleMiddleware.js";


const router = express.Router();

router.post("/:id/reviews", verifyToken, allowRoles(["student"]),submitReview);
router.get("/:hostel_id", getHostelReviews);
router.delete("/:id", verifyToken, deleteReview);
router.get("/:id/reviews/summary", getReviewSummary)
router.get("/:id/reviews", getReviews)

export default router;
