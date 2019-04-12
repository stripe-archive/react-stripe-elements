// @flow
/* eslint-disable no-console, react/no-multi-comp */
import React from 'react';
import {render} from 'react-dom';

import type {InjectedProps} from '../../src/components/inject';
import api from './api';

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

const createOptions = (fontSize: string, padding: ?string) => {
  return {
    style: {
      base: {
        fontSize,
        color: '#424770',
        letterSpacing: '0.025em',
        fontFamily: 'Source Code Pro, monospace',
        '::placeholder': {
          color: '#aab7c4',
        },
        ...(padding ? {padding} : {}),
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
};

class _HandleCardPayment extends React.Component<
  InjectedProps & {fontSize: string},
  {
    clientSecret: string | null,
    error: string | null,
    disabled: boolean,
    succeeded: boolean,
    processing: boolean,
    message: string | null,
  }
> {
  state = {
    clientSecret: null,
    error: null,
    disabled: true,
    succeeded: false,
    processing: false,
    message: null,
  };

  componentDidMount() {
    api
      .createPaymentIntent({
        amount: 1099,
        currency: 'usd',
        payment_method_types: ['card'],
      })
      .then((clientSecret) => {
        this.setState({clientSecret, disabled: false});
      })
      .catch((err) => {
        this.setState({error: err.message});
      });
  }

  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.props.stripe) {
      this.props.stripe
        .handleCardPayment(this.state.clientSecret)
        .then((payload) => {
          if (payload.error) {
            this.setState({
              error: `Charge failed: ${payload.error.message}`,
              disabled: false,
            });
            console.log('[error]', payload.error);
          } else {
            this.setState({
              succeeded: true,
              message: `Charge succeeded! Payment intent is in state: ${
                payload.paymentIntent.status
              }`,
            });
            console.log('[paymentIntent]', payload.paymentIntent);
          }
        });
      this.setState({disabled: true, processing: true});
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          stripe.handleCardPayment
          <CardElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        {this.state.error && <div className="error">{this.state.error}</div>}
        {this.state.message && (
          <div className="message">{this.state.message}</div>
        )}
        {!this.state.succeeded && (
          <button disabled={this.state.disabled}>
            {this.state.processing ? 'Processing…' : 'Pay'}
          </button>
        )}
      </form>
    );
  }
}

const HandleCardPayment = injectStripe(_HandleCardPayment);

class _CreatePaymentMethod extends React.Component<
  InjectedProps & {fontSize: string},
  {
    error: string | null,
    processing: boolean,
    message: string | null,
  }
> {
  state = {
    error: null,
    processing: false,
    message: null,
  };

  handleSubmit = (ev) => {
    ev.preventDefault();
    if (this.props.stripe) {
      this.props.stripe.createPaymentMethod().then((payload) => {
        if (payload.error) {
          this.setState({
            error: `Failed to create PaymentMethod: ${payload.error.message}`,
            processing: false,
          });
          console.log('[error]', payload.error);
        } else {
          this.setState({
            message: `Created PaymentMethod: ${payload.paymentMethod.id}`,
            processing: false,
          });
          console.log('[paymentMethod]', payload.paymentMethod);
        }
      });
      this.setState({processing: true});
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          stripe.createPaymentMethod
          <CardElement
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        {this.state.error && <div className="error">{this.state.error}</div>}
        {this.state.message && (
          <div className="message">{this.state.message}</div>
        )}
        <button disabled={this.state.processing}>
          {this.state.processing ? 'Processing…' : 'Pay'}
        </button>
      </form>
    );
  }
}

const CreatePaymentMethod = injectStripe(_CreatePaymentMethod);

class Checkout extends React.Component<{}, {elementFontSize: string}> {
  constructor() {
    super();
    this.state = {
      elementFontSize: window.innerWidth < 450 ? '14px' : '18px',
    };
    window.addEventListener('resize', () => {
      if (window.innerWidth < 450 && this.state.elementFontSize !== '14px') {
        this.setState({elementFontSize: '14px'});
      } else if (
        window.innerWidth >= 450 &&
        this.state.elementFontSize !== '18px'
      ) {
        this.setState({elementFontSize: '18px'});
      }
    });
  }

  render() {
    const {elementFontSize} = this.state;
    return (
      <div className="Checkout">
        <h1>Checkout with Payment Intents</h1>
        <Elements>
          <HandleCardPayment fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <CreatePaymentMethod fontSize={elementFontSize} />
        </Elements>
      </div>
    );
  }
}

const App = () => {
  return (
    <StripeProvider apiKey="pk_test_dCyfhfyeO2CZkcvT5xyIDdJj">
      <Checkout />
    </StripeProvider>
  );
};

const appElement = document.querySelector('.App');
if (appElement) {
  render(<App />, appElement);
} else {
  console.error(
    'We could not find an HTML element with a class name of "App" in the DOM. Please make sure you copy index.html as well for this demo to work.'
  );
}
