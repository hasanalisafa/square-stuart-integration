// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const axios = require('axios');
const app = express();

// Access the environment variables
const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
const squareAppId = process.env.SQUARE_APPLICATION_ID;
const stuartClientId = process.env.STUART_CLIENT_ID;
const stuartClientSecret = process.env.STUART_CLIENT_SECRET;
const stuartAccountId = process.env.STUART_ACCOUNT_ID;

// Middleware to parse JSON requests
app.use(express.json());

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Square webhook route - this is where Square sends its order updates
app.post('/webhook', (req, res) => {
  const event = req.body; // The event body sent by Square
  console.log('Received webhook event: ', event);

  // Check if the event is an order creation event
  if (event.type === 'order.created') {
    const orderId = event.data.id;
    const locationId = event.data.location_id;

    console.log(`Received new order: ${orderId} at location: ${locationId}`);

    // Wait for 15 minutes before creating the delivery in Stuart
    setTimeout(async () => {
      try {
        console.log('15 minutes passed, requesting delivery from Stuart...');
        
        // Prepare delivery data for Stuart (replace with actual pickup/dropoff details)
        const deliveryData = {
          pickup: {
            address: 'Pickup Address',  // Replace with actual pickup address
            contact: 'Pickup Contact'   // Replace with actual pickup contact
          },
          dropoff: {
            address: 'Dropoff Address', // Replace with actual dropoff address
            contact: 'Dropoff Contact'  // Replace with actual dropoff contact
          },
          order_id: orderId,  // Link delivery to the Square order
        };

        // Request the delivery in Stuart
        const stuartResponse = await axios.post('https://api.stuart.com/v2/deliveries', deliveryData, {
          headers: {
            'Authorization': `Bearer ${stuartClientSecret}`,
            'Content-Type': 'application/json',
          },
        });

        console.log('Delivery created in Stuart:', stuartResponse.data);
      } catch (error) {
        console.error('Error creating delivery in Stuart:', error.response ? error.response.data : error);
      }
    }, 900000);  // 15 minutes delay (900,000 milliseconds)
  }

  // Send a response back to Square indicating successful receipt of the webhook
  res.status(200).send('Webhook received');
});

// Handle Stuart Webhook (POST request for delivery status updates)
app.post('/stuart-webhook', (req, res) => {
  const deliveryUpdate = req.body;  // The event body sent by Stuart
  console.log('Received Stuart delivery status update: ', deliveryUpdate);

  // Check the status of the delivery and process accordingly
  if (deliveryUpdate.status === 'delivered') {
    const orderId = deliveryUpdate.order_id;  // Assuming the order_id is passed from Stuart

    // Here, you can update Square's order status to "delivered" (example)
    console.log(`Order ${orderId} has been delivered`);

    // Optional: You can use Square API here to update the order status in Square (if needed)
  }

  // Send a response back to Stuart indicating successful receipt of the webhook
  res.status(200).send('Status update received');
});

// Start the server and listen on a specific port
const port = process.env.PORT || 8080; // Make sure your server is running on the correct port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});