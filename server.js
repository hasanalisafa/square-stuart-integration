// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const app = express();

// Middleware to parse incoming JSON requests
app.use(bodyParser.json());

// Access the environment variables
const squareAccessToken = process.env.SQUARE_ACCESS_TOKEN;
const squareAppId = process.env.SQUARE_APPLICATION_ID;
const stuartClientId = process.env.STUART_CLIENT_ID;
const stuartClientSecret = process.env.STUART_CLIENT_SECRET;
const stuartAccountId = process.env.STUART_ACCOUNT_ID;
const PORT = process.env.PORT || 8080;

// Basic route to check if server is running
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// Webhook endpoint for Square to send order created event
app.post('/webhook', (req, res) => {
  try {
    console.log('Received Square webhook:', req.body); // Log the incoming request

    // Ensure the type is order.created
    if (req.body.type === 'order.created') {
      const orderId = req.body.data.id;
      console.log('Order created with ID:', orderId);

      // Use Stuart API to create delivery for this order
      axios.post('https://api.stuart.com/v2/delivery/create', {
        order_id: orderId, // Modify this based on your actual order data structure
        account_id: stuartAccountId,
      })
      .then(stuartResponse => {
        console.log('Stuart delivery response:', stuartResponse.data);
        res.status(200).send('Webhook received and order processed');
      })
      .catch(stuartError => {
        console.error('Error sending delivery to Stuart:', stuartError.response ? stuartError.response.data : stuartError);
        res.status(500).send('Error processing delivery');
      });
    } else {
      console.log('Invalid event type:', req.body.type);
      res.status(400).send('Invalid event type');
    }
  } catch (err) {
    console.error('Error in webhook handler:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Example: Use Square API to create an order
app.get('/square-order', (req, res) => {
  const url = `https://connect.squareup.com/v2/orders`;

  axios.post(url, {
    headers: {
      'Authorization': `Bearer ${squareAccessToken}`,
      'Content-Type': 'application/json'
    },
    data: {
      order: {
        id: "12345",  // Example order data
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
    console.error('Error making Square order:', error.response ? error.response.data : error);
    res.status(500).json({ error: error.response ? error.response.data : error });
  });
});

// Example: Use Stuart API to get access token
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
    console.error('Error getting Stuart access token:', error.response ? error.response.data : error);
    res.status(500).json({ error: error.response ? error.response.data : error });
  });
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});