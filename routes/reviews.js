const express = require("express");
const {
  getProviderReviews,
  createReview,
  updateReview,
  deleteReview,
  canReview,
} = require("../controllers/reviews");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router({ mergeParams: true });

router.get("/can-review", protect, canReview);
router
  .route("/")
  .get(getProviderReviews)
  .post(protect, authorize("user", "admin"), createReview);
router
  .route("/:reviewId")
  .put(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
