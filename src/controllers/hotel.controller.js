const prisma = require("../lib/prisma");

// Create Hotel
exports.createHotel = async (req, res) => {
  try {
    const {
      title,
      location,
      description,
      pricePerNight,
      rating,
      coverImage,
      images,
      starRating,
      propertyType,
      amenities,
      checkInTime,
      checkOutTime,
      hotelPolicies,
      includes,
      excludes,
    } = req.body;

    const newHotel = await prisma.hotel.create({
      data: {
        title,
        location,
        description,
        pricePerNight,
        rating,
        coverImage,
        images,
        starRating,
        propertyType,
        amenities,
        checkInTime,
        checkOutTime,
        hotelPolicies,
        includes,
        excludes,
      },
    });

    res.status(201).json({
      message: "Hotel created successfully",
      hotel: newHotel,
    });
  } catch (error) {
    console.error("Create Hotel Error:", error);
    res.status(500).json({
      message: "Failed to create hotel",
      error: error.message,
    });
  }
};

// Update Hotel
exports.updateHotel = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const updatedHotel = await prisma.hotel.update({
      where: { id },
      data: updateData,
    });

    res.json({
      message: "Hotel updated successfully",
      hotel: updatedHotel,
    });
  } catch (error) {
    console.error("Update Hotel Error:", error);
    res.status(500).json({
      message: "Failed to update hotel",
      error: error.message,
    });
  }
};

// Delete Hotel

exports.deleteHotel = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.hotel.delete({
      where: { id },
    });

    res.json({
      message: "Hotel deleted successfully",
    });
  } catch (error) {
    console.error("Delete Hotel Error:", error);
    res.status(500).json({
      message: "Failed to delete hotel",
      error: error.message,
    });
  }
};

// Get Single Hotel
exports.getHotelById = async (req, res) => {
  try {
    const { id } = req.params;

    const hotel = await prisma.hotel.findUnique({
      where: { id },
    });

    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    res.json({ hotel });
  } catch (error) {
    console.error("Get Hotel By ID Error:", error);
    res.status(500).json({
      message: "Failed to fetch hotel details",
      error: error.message,
    });
  }
};

// Get All Hotels with Search and Filter
exports.getAllHotels = async (req, res) => {
  try {
    const { destination, location, starRating, propertyType, amenities, pricePerNight } = req.query;

    // Build the where clause for Prisma
    const query = {};

    // Filter by exact price per night
    if (pricePerNight) {
      query.pricePerNight = parseFloat(pricePerNight);
    }

    // Filter by destination or location (searches in location or title)
    const searchQuery = destination || location;
    if (searchQuery) {
      query.OR = [
        { location: { contains: searchQuery, mode: "insensitive" } },
        { title: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    // Filter by Star Rating (e.g., starRating=4,5)
    if (starRating) {
      const ratingsArray = starRating.split(',').map(Number);
      query.starRating = { in: ratingsArray };
    }

    // Filter by Property Type (e.g., propertyType=Luxury)
    if (propertyType && propertyType !== 'All') {
      query.propertyType = propertyType;
    }

    // Filter by Amenities (e.g., amenities=Free WiFi,Pool)
    if (amenities) {
      const amenitiesArray = amenities.split(',');
      query.amenities = { hasEvery: amenitiesArray };
    }

    console.log("Received Postman Query:", req.query);
    console.log("Final Prisma Query:", query);

    const hotels = await prisma.hotel.findMany({
      where: query,
      orderBy: {
        createdAt: "desc"
      }
    });

    res.json({ hotels });
  } catch (error) {
    console.error("Get All Hotels Error:", error);
    res.status(500).json({
      message: "Failed to fetch hotels",
      error: error.message,
    });
  }
};

// Add Guest Information to Logged-in User
exports.addGuestInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, emailAddress, phoneNumber, country, specialRequests } = req.body;

    if (!fullName || !emailAddress || !phoneNumber || !country) {
      return res.status(400).json({ message: "Full Name, Email, Phone, and Country are required." });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const newGuest = await prisma.guestInfo.create({
      data: {
        fullName,
        emailAddress,
        phoneNumber,
        country,
        specialRequests: specialRequests || null,
        userId: userId,
      },
    });

    res.status(200).json({
      message: "Guest information added successfully",
      guestInfo: newGuest,
    });
  } catch (error) {
    console.error("Add Guest Info Error:", error);
    res.status(500).json({
      message: "Failed to add guest information",
      error: error.message,
    });
  }
};

// Get Guest Information for Logged-in User
exports.getGuestInfo = async (req, res) => {
  try {
    const userId = req.user.id;

    const guestInfo = await prisma.guestInfo.findMany({
      where: { userId },
    });

    res.status(200).json({
      guestInfo,
    });
  } catch (error) {
    console.error("Get Guest Info Error:", error);
    res.status(500).json({
      message: "Failed to fetch guest information",
      error: error.message,
    });
  }
};
