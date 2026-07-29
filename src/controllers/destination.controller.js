const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Add a new destination
const addDestination = async (req, res) => {
  try {
    const { title, location, packages, price, imageUrl } = req.body;

    if (!title || !location || !packages || !price || !imageUrl) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const destination = await prisma.destination.create({
      data: {
        title,
        location,
        packages: parseInt(packages),
        price: parseFloat(price),
        imageUrl,
      },
    });

    res.status(201).json({
      message: "Destination added successfully",
      destination,
    });
  } catch (error) {
    console.error("Error adding destination:", error);
    res.status(500).json({ error: "Failed to add destination" });
  }
};

// Get all destinations
const getDestinations = async (req, res) => {
  try {
    const destinations = await prisma.destination.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json(destinations);
  } catch (error) {
    console.error("Error fetching destinations:", error);
    res.status(500).json({ error: "Failed to fetch destinations" });
  }
};

// Update a destination (Patch)
const updateDestination = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, location, packages, price, imageUrl } = req.body;

    // Check if the destination exists
    const existingDestination = await prisma.destination.findUnique({
      where: { id },
    });

    if (!existingDestination) {
      return res.status(404).json({ error: "Destination not found" });
    }

    // Build update data only with provided fields
    const updateData = {};
    if (title) updateData.title = title;
    if (location) updateData.location = location;
    if (packages !== undefined) updateData.packages = parseInt(packages);
    if (price !== undefined) updateData.price = parseFloat(price);
    if (imageUrl) updateData.imageUrl = imageUrl;

    const updatedDestination = await prisma.destination.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: "Destination updated successfully",
      destination: updatedDestination,
    });
  } catch (error) {
    console.error("Error updating destination:", error);
    res.status(500).json({ error: "Failed to update destination" });
  }
};

// Delete a destination
const deleteDestination = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the destination exists
    const existingDestination = await prisma.destination.findUnique({
      where: { id },
    });

    if (!existingDestination) {
      return res.status(404).json({ error: "Destination not found" });
    }

    await prisma.destination.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Destination deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting destination:", error);
    res.status(500).json({ error: "Failed to delete destination" });
  }
};

module.exports = {
  addDestination,
  getDestinations,
  updateDestination,
  deleteDestination,
};
