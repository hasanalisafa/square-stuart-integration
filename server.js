// Square webhook route - this is where Square sends its order updates
app.post('/webhook', (req, res) => {
  const event = req.body; // The event body sent by Square
  console.log('Received webhook event: ', event);

  // Check if the event is an order creation event
  if (event.type === 'order.created') {
    const orderId = event.data.id;
    const locationId = event.data.location_id; // Extract location_id from Square event

    if (!locationId) {
      console.error("Location ID is missing in the Square webhook event");
      res.status(400).send('Location ID missing');
      return;
    }

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
          location_id: locationId,  // Pass location_id correctly
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