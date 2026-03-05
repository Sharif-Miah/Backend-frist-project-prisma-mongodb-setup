const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.post("/send-reset-otp", authController.sendResetOtp);
router.post("/verify-reset-otp", authController.verifyResetOtp);
router.post("/reset-password", authController.resetPassword);

router.get("/profile", authMiddleware, authController.profile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.delete("/profile", authMiddleware, authController.deleteAccoutn);
router.get("/users", authController.getAllUsers);

module.exports = router;
