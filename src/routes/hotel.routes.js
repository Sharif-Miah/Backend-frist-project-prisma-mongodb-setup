const express = require("express");
const router = express.Router();

const hotelController = require("../controllers/hotel.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, hotelController.createHotel);
router.get("/", hotelController.getAllHotels);
router.get("/:id", hotelController.getHotelById);
router.put("/:id", authMiddleware, hotelController.updateHotel);
router.delete("/:id", authMiddleware, hotelController.deleteHotel);

module.exports = router;
