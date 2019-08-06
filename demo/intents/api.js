// @flow

const createPaymentIntent = (options: {}): Promise<string> => {
  // To use this demo with your own Stripe account, clone this Runkit backend:
  // https://runkit.com/stripe/create-intents
  return window
    .fetch(`https://create-intents-35aylzrcx0ej.runkit.sh/payment_intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({options}),
    })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then((data) => {
      if (!data || data.error) {
        console.log('API error:', {data});
        throw new Error('PaymentIntent API Error');
      } else {
        return data.client_secret;
      }
    });
};

const createSetupIntent = (options: {}): Promise<string> => {
  // To use this demo with your own Stripe account, clone this Runkit backend:
  // https://runkit.com/stripe/create-intents
  return window
    .fetch(`https://create-intents-35aylzrcx0ej.runkit.sh/setup_intents`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({options}),
    })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        return null;
      }
    })
    .then((data) => {
      if (!data || data.error) {
        console.log('API error:', {data});
        throw new Error('SetupIntents API Error');
      } else {
        return data.client_secret;
      }
    });
};

const api = {
  createPaymentIntent,
  createSetupIntent,
};

export default api;
