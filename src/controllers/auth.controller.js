const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// Register api

// exports.register = async (req, res) => {
//   try {
//     const { name, email, password } = req.body;

//     console.log("Register bosy", req.body);

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         password: hashedPassword,
//       },
//     });

//     res.status(201).json(user);
//   } catch (error) {
//     console.error("Register Error:", error); // <-- Add this
//     res
//       .status(500)
//       .json({ message: "Something went wrong", error: error.message });
//   }
// };

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "Email is already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: { id: true, name: true, email: true, createdAt: true },
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Register Error:", error);
    res
      .status(500)
      .json({ message: "Failed to register user", error: error.message });
  }
};

// Login api

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return res.status(400).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch)
      return res.status(400).json({ message: "Invalis credentials" });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: "login failed" });
  }
};

// Generates OPT and saves it

exports.sendResetOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExpiry: otpExpiry,
      },
    });

    const htmlTemplate = `
<div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
  <div style="max-width: 450px; margin: auto; background: #ffffff; padding: 40px; border-radius: 16px; text-align: center; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
    
    <div style="margin-bottom: 20px;">
      <div style="display: inline-block; width: 60px; height: 60px; background: #eef2ff; border-radius: 50%; line-height: 60px;">
        <span style="font-size: 30px;">🔐</span>
      </div>
    </div>

    <h2 style="color: #1a1c1e; margin-bottom: 10px; font-weight: 700;">Verify Your Identity</h2>
    
    <p style="color: #64748b; font-size: 15px; line-height: 1.5; margin-bottom: 30px;">
      To complete your password reset, please enter the 6-digit verification code provided below.
    </p>

    <div style="font-family: 'Courier New', Courier, monospace; font-size: 36px; font-weight: 800; letter-spacing: 10px; color: #4f46e5; background: #f8fafc; border: 2px dashed #e2e8f0; padding: 20px; margin: 20px 0; border-radius: 12px;">
      ${otp}
    </div>

    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 30px;">
      This code is valid for <strong style="color: #475569;">5 minutes</strong>.
    </p>

    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin-bottom: 25px;">

    <p style="color: #94a3b8; font-size: 12px; line-height: 1.4;">
      Didn't request this? You can safely ignore this email. Your account security is our priority.
    </p>

    <p style="margin-top: 30px; font-size: 11px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1px;">
      © 2026 Your App &bull; Privacy Policy
    </p>

  </div>
</div>
`;

    await sendEmail(email, "Password Reset OTP", htmlTemplate);

    res.json({
      message: "OTP sent to email successfully",
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// Verify OTP

exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// Reset Password

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({ message: "invalid OTP" });
    }

    if (user.resetOtpExpiry < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: null,
        resetOtpExpiry: null,
      },
    });

    res.json({ message: "Password reset successfull" });
  } catch (error) {
    res.status(500).json({ message: "Password reset failed" });
  }
};

// GET ALL USERS

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    console.log(users);

    res.json({ users });
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Profile Api

exports.profile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("Profile Error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
};

// Update User Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from authMiddleware
    const { name, email, password } = req.body;

    console.log(req.body);

    const updateData = {};

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// Delete accoutn

exports.deleteAccoutn = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    res.json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete Account Error:", error);
    res.status(500).json({
      message: "Failed to delete account",
      error: error.message,
    });
  }
};
