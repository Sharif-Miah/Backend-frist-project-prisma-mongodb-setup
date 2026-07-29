const express = require("express");
const router = express.Router();

const {
  addDestination,
  getDestinations,
  getDestinationById,
  updateDestination,
  deleteDestination,
} = require("../controllers/destination.controller");

// Route to get all destinations
router.get("/", getDestinations);

// Route to get a single destination by ID
router.get("/:id", getDestinationById);

// Route to add a new destination
router.post("/", addDestination);

// Route to update a destination (partial update)
router.patch("/:id", updateDestination);

// Route to delete a destination
router.delete("/:id", deleteDestination);

module.exports = router;
