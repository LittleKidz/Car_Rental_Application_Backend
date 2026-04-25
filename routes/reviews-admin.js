const express = require("express");
const { getAllReviews } = require("../controllers/reviews");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get("/", protect, authorize("admin"), getAllReviews);

module.exports = router;
