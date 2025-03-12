const express = require("express");
const router = express.Router();
const { Cashfree } = require("cashfree-pg");
const crypto = require("crypto");
require("dotenv").config();



// Cashfree Configuration
Cashfree.XClientId = process.env.CLIENT_ID_PROD;
Cashfree.XClientSecret = process.env.CLIENT_SECRET_PROD;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// API version
const API_VERSION = "2023-08-01";

// Create Order Endpoint
router.post("/create-order", async (req, res) => {
    const { order_amount, customer_details, } = req.body;
    const order_id = `order_${crypto.randomBytes(8).toString("hex")}`;


    const request = {
        order_amount,
        "order_currency": "INR",
        order_id,
        customer_details
    };

    try {
        const response = await Cashfree.PGCreateOrder(API_VERSION, request);
        res.status(200).json({ message: "Order created successfully", data: response.data });
    } catch (error) {
        res.status(500).json({ message: "Error creating order", error: error.response?.data?.message || error.message });
    }
});

// Verify Payment Endpoint
router.get("/verify-payment/:order_id", async (req, res) => {
    const { order_id } = req.params;

    try {
        const response = await Cashfree.PGOrderFetchPayments(API_VERSION, order_id);
        const payments = response.data;
        let orderStatus;
        if (payments.filter(transaction => transaction.payment_status === "SUCCESS").length > 0) {
            orderStatus = "Success";
        } else if (payments.filter(transaction => transaction.payment_status === "PENDING").length > 0) {
            orderStatus = "Pending";
        } else {
            orderStatus = "Failure";
        }
        res.status(200).json({ message: "Order verification completed", orderStatus, payments });
    } catch (error) {
        res.status(500).json({ message: "Error verifying payment", error: error.response?.data?.message || error.message });
    }
});

module.exports = router;
