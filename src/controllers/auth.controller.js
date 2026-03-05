const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Register api

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    console.log("Register bosy", req.body);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json(user);
  } catch (error) {
    console.error("Register Error:", error); // <-- Add this
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
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

// generate a reset token

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const resetToken = crypto.randomBytes(32).toString("hex");

    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    });

    res.json({
      message: "Passoerd reset token genarated",
      resetToken,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate reset token" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return res.status(400).json({ message: "invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
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
