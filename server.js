// Import necessary libraries
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

// Initialize the express app
const app = express();
const PORT = process.env.PORT || 3000;  // Set the port for the server

// Use body parser to handle JSON data
app.use(bodyParser.json());

// Webhook route to receive Square orders
app.post('/square-webhook', async (req, res) => {
    const order = req.body;  // Get the order details from Square
    console.log('Received order from Square:', order);

    // Wait for 15 minutes before sending a delivery request to Stuart
    setTimeout(async () => {
        await createStuartDelivery(order);  // Call function to create Stuart delivery
    }, 15 * 60 * 1000);  // 15 minutes in milliseconds

    // Send a success response to Square
    res.status(200).send('Webhook received');
});

// Function to create a delivery with Stuart
async function createStuartDelivery(order) {
    const stuartApiUrl = 'https://api.stuart.com/v2/orders/';
    const stuartApiKey = 'YOUR_STUART_API_KEY';  // Replace with your Stuart API key

    const deliveryData = {
        pickup: {
            address: order.shipping_address,  // Replace with actual shipping address field
            contact: order.customer
        },
        dropoff: {
            address: order.shipping_address,  // Replace with customer address
            contact: order.customer
        }
    };

    try {
        const response = await axios.post(stuartApiUrl, deliveryData, {
            headers: {
                'Authorization': Bearer ${stuartApiKey},
                'Content-Type': 'application/json'
            }
        });
        console.log('Stuart delivery created:', response.data);
    } catch (error) {
        console.error('Error creating Stuart delivery:', error);
    }
}

// Start the server and listen on the specified port
app.listen(PORT, () => {
    console.log(Server is running on port ${PORT});
});