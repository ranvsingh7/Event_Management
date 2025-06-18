const cron = require("node-cron");
const Event = require("./models/Event"); // Adjust the path to your Event model if necessary.

// Nightly task to reset live status
cron.schedule("14 00 * * *", async () => {
    console.log("Running nightly task to update event live status...");

    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Update events in the past with `isLive` status
        const result = await Event.updateMany(
            { date: { $lt: today }, isLive: true }, // Match events in the past with `isLive` set to true
            { $set: { isLive: false } }            // Set `isLive` to false
        );

        console.log(`Updated ${result.nModified} events to isLive: false.`);
    } catch (error) {
        console.error("Error running nightly task:", error);
    }
});

module.exports = {}; // Optional, allows for import even if nothing is exported.
