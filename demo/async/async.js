// @flow
/* eslint-disable no-console, react/no-multi-comp */
import React from 'react';

import type {InjectedProps} from '../../src/components/inject';

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

class _CardForm extends React.Component<InjectedProps> {
  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.props.stripe) {
      this.props.stripe
        .createToken()
        .then((payload) => console.log('[token]', payload));
    } else {
      console.log('Form submitted before Stripe.js loaded.');
    }
  };
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>Card details</label>
        {this.props.stripe ? (
          <CardElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...CARD_ELEMENT_OPTIONS}
          />
        ) : (
          <div className="StripeElement loading" />
        )}
        <button disabled={!this.props.stripe}>Pay</button>
      </form>
    );
  }
}
const CardForm = injectStripe(_CardForm);

const Checkout = () => {
  return (
    <div className="Checkout">
      <Elements>
        <CardForm />
      </Elements>
    </div>
  );
};

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
        <Checkout />
      </StripeProvider>
    );
  }
}
