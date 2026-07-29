const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flight.controller");

// Route to get all flights (with optional filtering)
router.get("/", flightController.getFlights);

// Route to get a single flight by ID
router.get("/:id", flightController.getFlightById);

// Route to add a new flight
router.post("/", flightController.addFlight);

// Route to update a flight
router.patch("/:id", flightController.updateFlight);

// Route to delete a flight
router.delete("/:id", flightController.deleteFlight);

module.exports = router;
