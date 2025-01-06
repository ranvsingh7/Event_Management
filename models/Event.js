const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    date: { type: Date, required: true },
    entryTypes: [
        {
            name: {
                type: String,
                required: true,
            },
            amount: {
                type: Number,
                required: true,
            },
            count: {
                type: Number,
                required: true,
                default: 0,
            },
        },
    ],
    location: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

module.exports = mongoose.model("Event", eventSchema);
