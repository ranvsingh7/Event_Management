const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: "rzp_test_6nr1Kj7gZSDb5v",
    key_secret: "cY4rbPmeQj0ACu1N5eNUCdbc"
});

module.exports = razorpay;
