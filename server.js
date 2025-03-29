// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');

// Initialize Express app
const app = express();

// Use bodyParser to parse JSON requests
app.use(bodyParser.json());

// Access the environment variables
const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
const squareAppId = process.env.SQUARE_APPLICATION_ID;
const stuartClientId = process.env.STUART_CLIENT_ID;
const stuartClientSecret = process.env.STUART_CLIENT_SECRET;
const stuartAccountId = process.env.STUART_ACCOUNT_ID;

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Webhook route to receive Square orders
app.post('/webhook', (req, res) => {
  // Log the incoming webhook data (Square order created)
  console.log('Received Square order:', req.body);
  
  // You can add further logic here to process the order
  const orderData = req.body; // Square order details
  
  // Example of forwarding to Stuart (you can modify this to meet your needs)
  const stuartUrl = 'https://api.stuart.com/v2/oauth/token';
  
  axios.post(stuartUrl, {
    client_id: stuartClientId,
    client_secret: stuartClientSecret,
    grant_type: 'client_credentials'
  })
  .then(stuartResponse => {
    const stuartAccessToken = stuartResponse.data.access_token;
    
    // Now create a delivery request using the Stuart API
    const deliveryData = {
      // Use the Square order details to create a delivery request
      pickup_address: { /* Example pickup address from order */ },
      dropoff_address: { /* Example dropoff address from order */ },
      items: [
        { name: 'Sample Item', quantity: 1, price: 100 } // Add items from the order
      ],
    };
    
    // Send the delivery request to Stuart
    axios.post('https://api.stuart.com/v2/jobs', deliveryData, {
      headers: {
        'Authorization': `Bearer ${stuartAccessToken}`,
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      console.log('Delivery successfully created with Stuart:', response.data);
      res.status(200).send('Order received and delivery created.');
    })
    .catch(error => {
      console.error('Error creating delivery with Stuart:', error);
      res.status(500).send('Error creating delivery with Stuart');
    });
  })
  .catch(error => {
    console.error('Error getting Stuart access token:', error);
    res.status(500).send('Error authenticating with Stuart');
  });
});

// Start the server and listen on a specific port
const port = process.env.PORT || 8080;  // Railway assigns a port automatically
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});