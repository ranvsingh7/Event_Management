const express = require("express");
const Booking = require("../models/Booking");
const { authMiddleware } = require("../middleware/auth");
const Event = require("../models/Event");
const { default: mongoose } = require("mongoose");

const router = express.Router();

// // Get All My Booking
// router.get("/my-bookings", authMiddleware, async (req, res) => {
//     try {
//         const bookings = await Booking.find().populate(
//             "createdBy",
//             "username email"
//         );
//         res.status(200).json(bookings);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// Create Booking
router.post("/create-booking",  async (req, res) => {

    try {
        const event = await Event.findById(req.body.eventId);
        const selectedPassArray = event.entryTypes.filter(
            (entry) => {
                const objectId = new mongoose.Types.ObjectId(entry._id);
                const stringId = objectId.toString();
                return stringId === req.body.entryType;
            }
        );
        if (selectedPassArray.length === 0) {
            return res.status(404).json({ error: "Pass not found" });
        }
        const selectedPass = selectedPassArray[0];
        
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        // check mobile number if it is 10 digits 
        // if (req.body.mobile.length !== 10) {
        //     return res.status(400).json({ error: "Mobile number should be 10 digits" });
        // }
        const booking = new Booking({
            name: req.body.name,
            email: req.body.email,
            mobile: req.body.mobile,
            amount: selectedPass.amount,
            passCount: selectedPass.count,
            entryTitle: selectedPass.name,
            remainingCount: selectedPass.count,
            entryType: req.body.entryType,
            eventId: req.body.eventId,
            eventUserId: event.createdBy._id,
        });

        await booking.save();
        res.status(201).json(booking);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: error.message });
    }
});

// Pass Check-In

router.put("/check-in/:id", async (req, res) => {
    const { checkPassCount } = req.body;

    try {
        // Find the booking by ID
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // Validate checkPassCount
        if (checkPassCount > booking.remainingCount) {
            return res
                .status(400)
                .json({ message: "CheckPassCount exceeds the remaining count" });
        }

        // Update the remainingCount
        const updatedRemainingCount = booking.remainingCount - checkPassCount;

        // Update the booking with new values
        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            {
                passCount: booking.passCount, 
                remainingCount: updatedRemainingCount,
                checkedCount: booking.checkedCount + checkPassCount,
            },
            { new: true }
        );

        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Booking by ID
router.get("/pass/:id", authMiddleware, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if(booking){
            if(booking.eventUserId.toString() !== req.user.id){
                return res.status(401).json({ message: "Pass not Valid" });
            }
        }

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
        const bookings = await Booking.find()
            .populate("eventId", "name location date"); 

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings:", error);
        res.status(500).json({ error: error.message });
    }
});

// Get My Bookings by User ID
router.get("/:userId", authMiddleware, async (req, res) => {
    const { userId } = req.params;

    try {
        const bookings = await Booking.find({ eventUserId: userId })
            .populate("eventId", "name location date") 
            .populate("eventUserId", "username email"); 

        if (!bookings.length) {
            return res.status(404).json({ message: "No bookings found for this user" });
        }

        res.status(200).json(bookings);
    } catch (error) {
        console.error("Error fetching bookings for user:", error);
        res.status(500).json({ error: error.message });
    }
});


module.exports = router;
