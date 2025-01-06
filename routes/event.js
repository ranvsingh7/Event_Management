const express = require("express");
const Event = require("../models/Event");
const { authMiddleware } = require("../middleware/auth");

const router = express.Router();

// Get All My Events
router.get("/my-events", authMiddleware, async (req, res) => {
    try {
        const events = await Event.find({ createdBy: req.user.id }).populate(
            "createdBy",
            "username email"
        );
        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create Event
router.post("/", authMiddleware, async (req, res) => {
    const { name, description, date, location, entryTypes } = req.body;

    try {
        const event = new Event({
            name,
            description,
            date,
            location,
            entryTypes,
            createdBy: req.user.id,
        });

        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update Event
router.put("/:id", authMiddleware, async (req, res) => {
    const { name, description, date, location, entryTypes } = req.body;

    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            {
                name,
                description,
                date,
                location,
                entryTypes,
            },
            { new: true }
        );

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Event by ID
router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get All Events
router.get("/", async (req, res) => {
    try {
        const events = await Event.find().populate("createdBy", "username email");

        res.status(200).json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete Event
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({ message: "Event deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
