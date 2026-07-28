const express = require("express");
const router = express.Router();
const flightController = require("../controllers/flight.controller");

// Route to add a new flight
router.post("/", flightController.addFlight);

// Route to get all flights (with optional filtering)
router.get("/", flightController.getFlights);

module.exports = router;
