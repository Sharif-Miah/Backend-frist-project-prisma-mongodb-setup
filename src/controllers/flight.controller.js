const prisma = require("../lib/prisma");

// Add a new flight
exports.addFlight = async (req, res) => {
  try {
    const {
      airline,
      flightNumber,
      departureTime,
      arrivalTime,
      departureAirport,
      arrivalAirport,
      duration,
      isDirect,
      price,
      amenities,
      coverImage,
      cabinClass,
      baggageAllowance,
      refundPolicy,
      dateChangePolicy,
      mealAvailability,
      includedInFare,
    } = req.body;

    const newFlight = await prisma.flight.create({
      data: {
        airline,
        flightNumber,
        departureTime,
        arrivalTime,
        departureAirport,
        arrivalAirport,
        duration,
        isDirect: isDirect !== undefined ? isDirect : true,
        price: parseFloat(price),
        amenities: amenities || [],
        coverImage,
        cabinClass,
        baggageAllowance,
        refundPolicy,
        dateChangePolicy,
        mealAvailability,
        includedInFare: includedInFare || [],
      },
    });

    res.status(201).json({
      message: "Flight added successfully",
      flight: newFlight,
    });
  } catch (error) {
    console.error("Add Flight Error:", error);
    res
      .status(500)
      .json({ message: "Failed to add flight", error: error.message });
  }
};

// Get all flights with filtering
exports.getFlights = async (req, res) => {
  try {
    const { departureAirport, arrivalAirport, airline } = req.query;

    // Build the query object based on provided filters
    const query = {};

    if (departureAirport) {
      query.departureAirport = {
        contains: departureAirport,
        mode: "insensitive", // case-insensitive search
      };
    }

    if (arrivalAirport) {
      query.arrivalAirport = {
        contains: arrivalAirport,
        mode: "insensitive",
      };
    }

    if (airline) {
      query.airline = {
        contains: airline,
        mode: "insensitive",
      };
    }

    const flights = await prisma.flight.findMany({
      where: query,
      orderBy: {
        price: "asc", // sort by price low to high by default
      },
    });

    res.json({
      message: "Flights retrieved successfully",
      count: flights.length,
      flights,
    });
  } catch (error) {
    console.error("Get Flights Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch flights", error: error.message });
  }
};

// Get a single flight by ID
exports.getFlightById = async (req, res) => {
  try {
    const { id } = req.params;

    const flight = await prisma.flight.findUnique({
      where: { id },
    });

    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    res.status(200).json(flight);
  } catch (error) {
    console.error("Get Flight By ID Error:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch flight", error: error.message });
  }
};

// Update a flight (Patch)
exports.updateFlight = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingFlight = await prisma.flight.findUnique({
      where: { id },
    });

    if (!existingFlight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    if (updateData.price !== undefined) updateData.price = parseFloat(updateData.price);

    const updatedFlight = await prisma.flight.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      message: "Flight updated successfully",
      flight: updatedFlight,
    });
  } catch (error) {
    console.error("Update Flight Error:", error);
    res
      .status(500)
      .json({ message: "Failed to update flight", error: error.message });
  }
};

// Delete a flight
exports.deleteFlight = async (req, res) => {
  try {
    const { id } = req.params;

    const existingFlight = await prisma.flight.findUnique({
      where: { id },
    });

    if (!existingFlight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    await prisma.flight.delete({
      where: { id },
    });

    res.status(200).json({
      message: "Flight deleted successfully",
    });
  } catch (error) {
    console.error("Delete Flight Error:", error);
    res
      .status(500)
      .json({ message: "Failed to delete flight", error: error.message });
  }
};
