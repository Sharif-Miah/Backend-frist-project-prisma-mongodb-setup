const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authMiddleware = require("./middleware/auth.middleware");

const authRoutes = require("./routes/auth.routes");
const flightRoutes = require("./routes/flight.routes");
const destinationRoutes = require("./routes/destination.routes");
const hotelRoutes = require("./routes/hotel.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/destinations", destinationRoutes);
app.use("/api/hotels", hotelRoutes);


app.get("/", (req, res) => {
  res.send("Backend is running");
});

const prisma = require("./lib/prisma");

app.get("/api/profile", authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, name: true, email: true, guestInfo: true, travelers: true }
    });
    res.json({ message: "User profile", user });
  } catch (error) {
    res.status(500).json({ message: "Error fetching user profile", error: error.message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
