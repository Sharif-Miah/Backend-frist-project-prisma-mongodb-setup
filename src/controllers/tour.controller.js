const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Create a Tour
exports.createTour = async (req, res) => {
  try {
    const tour = await prisma.tour.create({
      data: req.body,
    });
    res.status(201).json({ message: "Tour created successfully", tour });
  } catch (error) {
    console.error("Create Tour Error:", error);
    res.status(500).json({ message: "Failed to create tour", error: error.message });
  }
};

// Get All Tours
exports.getAllTours = async (req, res) => {
  try {
    const tours = await prisma.tour.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ tours });
  } catch (error) {
    console.error("Get All Tours Error:", error);
    res.status(500).json({ message: "Failed to fetch tours", error: error.message });
  }
};

// Get Single Tour
exports.getTourById = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await prisma.tour.findUnique({
      where: { id },
    });
    
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    
    res.json({ tour });
  } catch (error) {
    console.error("Get Tour Error:", error);
    res.status(500).json({ message: "Failed to fetch tour", error: error.message });
  }
};

// Update a Tour
exports.updateTour = async (req, res) => {
  try {
    const { id } = req.params;
    const tour = await prisma.tour.update({
      where: { id },
      data: req.body,
    });
    res.json({ message: "Tour updated successfully", tour });
  } catch (error) {
    console.error("Update Tour Error:", error);
    res.status(500).json({ message: "Failed to update tour", error: error.message });
  }
};

// Delete a Tour
exports.deleteTour = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.tour.delete({
      where: { id },
    });
    res.json({ message: "Tour deleted successfully" });
  } catch (error) {
    console.error("Delete Tour Error:", error);
    res.status(500).json({ message: "Failed to delete tour", error: error.message });
  }
};

// Get Booking Summary for a Tour
exports.getBookingSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const { adults = 1, travelDate, specialRequests } = req.body;
    
    const tour = await prisma.tour.findUnique({
      where: { id },
    });
    
    if (!tour) return res.status(404).json({ message: "Tour not found" });
    
    // Calculation matching the UI screenshot:
    // Tour Price (Adults * Price)
    const basePrice = tour.price * adults;
    // Taxes (5%)
    const taxes = basePrice * 0.05;
    // Service Fee (Fixed $15 for example, or based on logic)
    const serviceFee = 15.0; 
    
    const totalAmount = basePrice + taxes + serviceFee;
    
    res.json({
      summary: {
        tourName: tour.title,
        location: tour.location,
        duration: tour.duration,
        travelDate,
        specialRequests,
        adults: parseInt(adults),
        pricePerAdult: tour.price,
        basePrice,
        taxes,
        serviceFee,
        totalAmount
      }
    });
  } catch (error) {
    console.error("Get Booking Summary Error:", error);
    res.status(500).json({ message: "Failed to get booking summary", error: error.message });
  }
};
