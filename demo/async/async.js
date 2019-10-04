// @flow
/* eslint-disable no-console, react/no-multi-comp */
import React, {useRef} from 'react';

import type {AsyncInjectedProps} from '../../src/components/inject';

import {
  CardElement,
  StripeProvider,
  Elements,
  injectStripe,
} from '../../src/index';

const handleBlur = () => {
  console.log('[blur]');
};
const handleChange = (change) => {
  console.log('[change]', change);
};
const handleFocus = () => {
  console.log('[focus]');
};
const handleReady = () => {
  console.log('[ready]');
};

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '18px',
      color: '#424770',
      letterSpacing: '0.025em',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

const CardFormCheckout = injectStripe(({stripe}: AsyncInjectedProps) => {
  const ref = useRef();
  const handleSubmit = (e) => {
    e.preventDefault();
    if (stripe && ref.current) {
      ref.current
        .getElement()
        .then((element) => stripe.createToken(element))
        .then((payload) => {
          console.log('[token]', payload);
        });
    }
  };

  return (
    <Elements>
      <div className="Checkout">
        <form onSubmit={handleSubmit}>
          <label>Card details</label>
          {stripe ? (
            <CardElement
              ref={ref}
              onBlur={handleBlur}
              onChange={handleChange}
              onFocus={handleFocus}
              onReady={handleReady}
              {...CARD_ELEMENT_OPTIONS}
            />
          ) : (
            <div className="StripeElement loading" />
          )}
          <button disabled={!stripe}>Pay</button>
        </form>
      </div>
    </Elements>
  );
});

export class App extends React.Component<{}, {stripe: null | StripeShape}> {
  constructor() {
    super();
    this.state = {
      stripe: null,
    };
  }

  componentDidMount() {
    // componentDidMount only runs in a browser environment.
    // In addition to loading asynchronously, this code is safe to server-side render.

    // You can inject a script tag manually like this,
    // or you can use the 'async' attribute on the Stripe.js v3 <script> tag.
    const stripeJs = document.createElement('script');
    stripeJs.src = 'https://js.stripe.com/v3/';
    stripeJs.async = true;
    stripeJs.onload = () => {
      // The setTimeout lets us pretend that Stripe.js took a long time to load
      // Take it out of your production code!
      setTimeout(() => {
        this.setState({
          stripe: window.Stripe('pk_test_6pRNASCoBOKtIshFeQd4XMUh'),
        });
      }, 500);
    };
    document.body && document.body.appendChild(stripeJs);
  }

  render() {
    return (
      <StripeProvider stripe={this.state.stripe}>
        <CardFormCheckout />
      </StripeProvider>
    );
  }
}
