const express = require("express");
const Booking = require("../models/Booking");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Get All My Booking
router.get("/my-bookings", authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({ createdBy: req.user.id }).populate(
            "createdBy",
            "username email"
        );
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Booking
router.post("/", authMiddleware, async (req, res) => {
    const { passCount } = req.body;

    try {
        const booking = new Booking({
            name: req.user.name,
            email: req.user.email,
            mobile: req.user.mobile,
            passCount,
            createdBy: req.user.id,
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Booking by ID
router.get("/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json(booking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Bookings
router.get("/", async (req, res) => {
    try {
        const bookings = await Booking.find().populate("createdBy", "username email");

        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
