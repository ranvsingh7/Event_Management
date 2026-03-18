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

const DEBUG_ENABLED = process.env.DEBUG_ENABLED === "true";
const DEBUG_KEY = process.env.DEBUG_KEY || "";


const url = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://paperlessticket.ranveersingh.me";


// CORS configuration
const allowedOrigins = [
    "http://localhost:3000", // Local frontend
    "https://paperlessticket.ranveersingh.me", // Deployed frontend
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
    const requestId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    req.requestId = requestId;
    const start = Date.now();

    console.log(`[${requestId}] ${req.method} ${req.originalUrl} origin=${req.headers.origin || "n/a"}`);

    res.on("finish", () => {
      const duration = Date.now() - start;
      console.log(`[${requestId}] ${res.statusCode} ${req.method} ${req.originalUrl} ${duration}ms`);
    });

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

app.get("/api/debug/config-health", (req, res) => {
  if (!DEBUG_ENABLED) {
    return res.status(404).json({ message: "Not found" });
  }

  const key = req.headers["x-debug-key"] || req.query.key;
  if (!DEBUG_KEY || key !== DEBUG_KEY) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json({
    nodeEnv: process.env.NODE_ENV || "unknown",
    timestamp: new Date().toISOString(),
    smtpConfigured: Boolean(process.env.SMTP_USER && process.env.SMTP_PASS),
    cashfreeConfigured: Boolean(process.env.CLIENT_ID_PROD && process.env.CLIENT_SECRET_PROD),
    jwtConfigured: Boolean(process.env.JWT_SECRET),
    apiBaseHint: process.env.CLIENT_BASE_URL || null,
  });
});


const PORT = process.env.PORT || 6000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
