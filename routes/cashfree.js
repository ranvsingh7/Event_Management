const express = require('express');
const crypto = require('crypto');
const { Cashfree } = require('cashfree-pg');
require('dotenv').config();

const router = express.Router();

// Setup Cashfree
Cashfree.XClientId = process.env.CLIENT_ID;
Cashfree.XClientSecret = process.env.CLIENT_SECRET;
Cashfree.XEnvironment = Cashfree.Environment.PRODUCTION;

// Generate Order ID
function generateOrderId() {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const hash = crypto.createHash('sha256');
    hash.update(uniqueId);
    const orderId = hash.digest('hex');
    return orderId.substr(0, 12);
}

// Payment Route
router.get('/payment', async (req, res) => {
    const order_id = generateOrderId()
    try {
        const request = {
            order_amount: 1.00,
            order_currency: "INR",
            order_id: order_id,
            customer_details: {
                customer_id: "webcodder01",
                customer_phone: "9999999999",
                customer_name: "Web Codder",
                customer_email: "webcodder@example.com",
            },
        };

        Cashfree.PGCreateOrder("2023-08-01", request)
            .then(response => {
                console.log(response.data);
                res.json(response.data);
            })
            .catch(error => {
                console.error(error.response.data.message);
                res.status(500).json({ error: error.response.data.message });
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Verify Payment Route
router.post('/verify', async (req, res) => {
    try {
        const { orderId } = req.body;

        Cashfree.PGOrderFetchPayments("2023-08-01", orderId)
            .then(response => {
                res.json(response.data);
            })
            .catch(error => {
                console.error(error.response.data.message);
                res.status(500).json({ error: error.response.data.message });
            });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router; 
