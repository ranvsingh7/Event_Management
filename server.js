const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/event");
const cors = require("cors");



require("dotenv").config();

const app = express();


const allowedOrigins = [
    "http://localhost:3000",
    "https://event-frontend-snowy.vercel.app"
];

// CORS configuration
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            // Allow requests with no origin (like mobile apps or curl requests)
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
};

app.use(cors(corsOptions));


// Middleware
app.use(bodyParser.json());

// Database Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", require("./routes/booking"));


const PORT = process.env.PORT || 6000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
