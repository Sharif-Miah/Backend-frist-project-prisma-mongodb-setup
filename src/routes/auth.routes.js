const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.profile);
router.put("/profile", authMiddleware, authController.updateProfile);
router.delete("/profile", authMiddleware, authController.deleteAccoutn);
router.get("/users", authMiddleware, authController.getAllUsers);

module.exports = router;
