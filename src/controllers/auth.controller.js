const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
