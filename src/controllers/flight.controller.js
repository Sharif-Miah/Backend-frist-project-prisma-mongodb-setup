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
