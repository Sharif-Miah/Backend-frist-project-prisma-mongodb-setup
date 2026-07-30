const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);

router.post("/send-reset-otp", authController.sendResetOtp);
router.post("/verify-reset-otp", authController.verifyResetOtp);
router.post("/reset-password", authController.resetPassword);

router.get("/profile", authMiddleware, authController.profile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.put("/travelers", authMiddleware, authController.updateTravelers);
router.delete("/profile", authMiddleware, authController.deleteAccoutn);
router.get("/users", authController.getAllUsers);

module.exports = router;
