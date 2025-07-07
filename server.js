const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const eventRoutes = require("./routes/event");
const cashfree = require("./routes/cashfree");
const emailService = require("./routes/email-service");
const cors = require("cors");
require("dotenv").config();
require("./nightlyTask");

const app = express();


const url = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://paperlessticket.ranveersingh.me";


// CORS configuration
const allowedOrigins = [
    "http://localhost:3000", // Local frontend
    "https://event-frontend-sdsw.vercel.app", // Deployed frontend
  ];
  
  const corsOptions = {
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
  
  app.use(cors(corsOptions));
  app.options("*", cors(corsOptions));

  app.use((req, res, next) => {
    console.log("Origin:", req.headers.origin);
    next();
  });
  


// Middleware
app.use(bodyParser.json());

// Database Connection
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", require("./routes/booking"));
app.use("/api/cashfree", cashfree);
app.use("/api/email-service", emailService); // Email service route


const PORT = process.env.PORT || 6000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
