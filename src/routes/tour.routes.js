const express = require("express");
const router = express.Router();
const tourController = require("../controllers/tour.controller");

// Tour CRUD Routes
router.post("/", tourController.createTour);
router.get("/", tourController.getAllTours);
router.get("/:id", tourController.getTourById);
router.put("/:id", tourController.updateTour);
router.delete("/:id", tourController.deleteTour);

// Tour Booking Summary
router.post("/:id/booking-summary", tourController.getBookingSummary);

module.exports = router;
