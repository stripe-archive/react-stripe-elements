// @flow

const {STRIPE_SECRET_KEY} = process.env;

const serialize = (object: Object, scope: ?string): string => {
  let result = [];
  Object.keys(object).forEach((key) => {
    const value = object[key];
    const scopedKey = scope ? `${scope}[${key}]` : key;
    if (value && typeof value === 'object') {
      const nestedResult = serialize(value, scopedKey);
      if (nestedResult !== '') {
        result = [...result, nestedResult];
      }
    } else if (value !== undefined && value !== null) {
      result = [...result, `${scopedKey}=${encodeURIComponent(String(value))}`];
    }
  });
  return result.join('&').replace(/%20/g, '+');
};

const createPaymentIntent = (options: {}): Promise<string> => {
  if (!STRIPE_SECRET_KEY) {
    return Promise.reject(
      new Error(
        `A secret key is required to create PaymentIntents for handleCardPayment. Please set the following environment variable: \n\nSTRIPE_SECRET_KEY=<your secret key>`
      )
    );
  }

  // WARNING
  // DO NOT USE THE FOLLOWING CODE IN A PRODUCTION APPLICATION!
  // Your secret key should NEVER be used in on your frontend.
  // We are doing this here purely for demonstration reasons.
  // In the real world, creating PaymentIntents needs to be done
  // on your backend server.
  //
  // Including your secret key on your frontend enables others
  // to make charges on your behalf. Fraudsters will find your
  // secret key and use it to test stolen card numbers, which will
  // get your business banned from accepting credit card payments.
  return window
    .fetch(`https://api.stripe.com/v1/payment_intents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: serialize(options),
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

const api = {
  createPaymentIntent,
};

export default api;
