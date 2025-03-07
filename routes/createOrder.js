const express = require('express');
const router = express.Router();
const razorpay = require('../razorpay');

// Create payment order
router.post('/create-order', async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;

    // Create an order on Razorpay
    const options = {
      amount: amount * 100, // Convert to smallest currency unit
      currency: currency || 'INR',
      receipt: receipt || `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({ success: true, order });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get("/payment-status/:id", async (req, res) => {
  try {
    const { id } = req.params; // Extract the payment ID from URL

    // Validate the payment ID
    if (!id || typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing payment ID",
      });
    }

    // Fetch payment details from Razorpay
    const payment = await razorpay.payments.fetch(id);

    // If no payment is found
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    // If payment is found, send the details
    res.status(200).json({
      success: true,
      payment,
    });
  } catch (error) {
    console.error("Error fetching payment:", error);

    // Handle Razorpay errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.error.description || "Razorpay API error",
      });
    }

    // General server error
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

// Endpoint to capture payment
router.post("/capture-payment", async (req, res) => {
  console.log(req.body);
  try {
    const { paymentId, amount } = req.body; // Payment ID and amount in the request body

    // Validate input
    if (!paymentId || !amount) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and amount are required",
      });
    }

    // Convert amount to the smallest currency unit (e.g., INR -> paise)
    const amountInPaise = amount * 100;

    // Capture the payment
    const payment = await razorpay.payments.capture(paymentId, amountInPaise);

    // Return success response
    res.status(200).json({
      success: true,
      message: "Payment captured successfully",
      payment,
    });
  } catch (error) {
    console.error("Error capturing payment:", error);

    // Handle Razorpay errors
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.error.description || "Razorpay API error",
      });
    }

    // General server error
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
module.exports = router;
