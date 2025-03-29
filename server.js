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

// Example: Use Square API (Square API call)
app.get('/square-order', (req, res) => {
  const url = `https://connect.squareup.com/v2/orders`;
  
  axios.post(url, {
    headers: {
      'Authorization': `Bearer ${squareAccessToken}`,
      'Content-Type': 'application/json'
    },
    data: {
      // Example order data here
      order: {
        id: "12345",
        location_id: "your-location-id",
        line_items: [
          {
            name: "Sample Item",
            quantity: 1,
            base_price_money: { amount: 100, currency: 'USD' }
          }
        ]
      }
    }
  })
  .then(response => {
    console.log('Square order response:', response.data);
    res.json(response.data);
  })
  .catch(error => {
    console.error('Error making Square order:', error.response.data);
    res.status(500).json({ error: error.response.data });
  });
});

// Example: Use Stuart API (Create delivery)
app.get('/stuart-delivery', (req, res) => {
  const stuartUrl = 'https://api.stuart.com/v2/oauth/token';
  
  axios.post(stuartUrl, {
    client_id: stuartClientId,
    client_secret: stuartClientSecret,
    grant_type: 'client_credentials'
  })
  .then(response => {
    console.log('Stuart API Access Token:', response.data.access_token);
    res.json({ accessToken: response.data.access_token });
  })
  .catch(error => {
    console.error('Error getting Stuart access token:', error.response.data);
    res.status(500).json({ error: error.response.data });
  });
});

// Handle Square Webhook (POST request from Square)
app.post('/webhook', (req, res) => {
  const event = req.body; // The event body sent by Square
  console.log('Received webhook event: ', event);

  // You can handle the event based on the type (order.created, order.updated, etc.)
  // Example: Trigger Stuart API or do something with the order data here
  if (event.type === 'order.created') {
    const orderId = event.data.id;
    const locationId = event.data.location_id;
    
    // Call Stuart API or another action based on the order details
    console.log(`Received new order: ${orderId} at location: ${locationId}`);

    // Example: Make a delivery request (This is just a placeholder, update it as needed)
    // If needed, you can send this data to Stuart or process it further
  }

  // Send a response back to Square indicating successful receipt of the webhook
  res.status(200).send('Webhook received');
});

// Start the server and listen on a specific port
const port = process.env.PORT || 8080; // Make sure your server is running on the correct port
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});