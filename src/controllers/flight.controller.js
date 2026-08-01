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
    const { departureAirport, arrivalAirport, airline, stops } = req.query;

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

    // Filter by multiple airlines (e.g., Emirates,Qatar Airways)
    if (airline) {
      let airlineArray = [];
      if (Array.isArray(airline)) {
        airlineArray = airline;
      } else if (typeof airline === "string") {
        airlineArray = airline.split(",").map((a) => a.trim());
      }

      if (airlineArray.length === 1) {
        query.airline = {
          contains: airlineArray[0],
          mode: "insensitive",
        };
      } else if (airlineArray.length > 1) {
        query.airline = {
          in: airlineArray,
        };
      }
    }

    // Filter by stops (e.g., Direct, 1 Stop, 2+ Stops)
    if (stops) {
      let stopsArray = [];
      if (Array.isArray(stops)) {
        stopsArray = stops.map(s => s.toLowerCase());
      } else if (typeof stops === "string") {
        stopsArray = stops.split(",").map((s) => s.trim().toLowerCase());
      }

      let isDirectConditions = [];
      if (stopsArray.includes("direct")) {
        isDirectConditions.push(true);
      }
      if (stopsArray.includes("1 stop") || stopsArray.includes("2+ stops")) {
        isDirectConditions.push(false);
      }

      // If only true or only false is selected, apply the filter
      if (isDirectConditions.length === 1) {
        query.isDirect = isDirectConditions[0];
      }
      // If both are selected (e.g., Direct and 1 Stop), it fetches all (no filter needed)
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
