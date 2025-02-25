const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    name: { type: String, required: true },
    eventName: { type: String, required: true },
    eventDesc: { type: String, required: true },
    eventDate: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: String, required: true },
    amount: { type: Number, required: true },
    passCount: { type: Number, required: true },
    remainingCount: { type: Number, required: true },
    checkedCount: { type: Number, required: true, default: 0 },
    entryTitle: { type: String, required: true },
    entryType: { type: String, required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    eventUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    // createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
