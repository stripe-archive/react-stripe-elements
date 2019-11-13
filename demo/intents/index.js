// @flow
/* eslint-disable no-console, react/no-multi-comp */
import React from 'react';
import {render} from 'react-dom';

import type {InjectedProps} from '../../src/components/inject';

import {
  CardElement,
  StripeProvider,
  Elements,
  injectStripe,
} from '../../src/index';

import api from './api';

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
    if (this.props.stripe && this.props.elements) {
      this.props.stripe
        .createPaymentMethod({
          type: 'card',
          card: this.props.elements.getElement('card'),
        })
        .then((payload) => {
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
          {this.state.processing ? 'Processing…' : 'Create'}
        </button>
      </form>
    );
  }
}

const CreatePaymentMethod = injectStripe(_CreatePaymentMethod);

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
    if (this.props.stripe && this.props.elements) {
      this.props.stripe
        .confirmCardPayment(this.state.clientSecret, {
          payment_method: {
            card: this.props.elements.getElement('card'),
          },
        })
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
              message: `Charge succeeded! PaymentIntent is in state: ${
                payload.paymentIntent.status
              }`,
            });
            console.log('[PaymentIntent]', payload.paymentIntent);
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
          stripe.confirmCardPayment
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

class _HandleCardSetup extends React.Component<
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
      .createSetupIntent({
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
    if (this.props.stripe && this.props.elements) {
      this.props.stripe
        .confirmCardSetup(this.state.clientSecret, {
          payment_method: {
            card: this.props.elements.getElement('card'),
          },
        })
        .then((payload) => {
          if (payload.error) {
            this.setState({
              error: `Setup failed: ${payload.error.message}`,
              disabled: false,
            });
            console.log('[error]', payload.error);
          } else {
            this.setState({
              succeeded: true,
              message: `Setup succeeded! SetupIntent is in state: ${
                payload.setupIntent.status
              }`,
            });
            console.log('[SetupIntent]', payload.setupIntent);
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
          stripe.confirmCardSetup
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
            {this.state.processing ? 'Processing…' : 'Setup'}
          </button>
        )}
      </form>
    );
  }
}

const HandleCardSetup = injectStripe(_HandleCardSetup);

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
        <h1>React Stripe Elements with PaymentIntents</h1>
        <Elements>
          <CreatePaymentMethod fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <HandleCardPayment fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <HandleCardSetup fontSize={elementFontSize} />
        </Elements>
      </div>
    );
  }
}

const App = () => {
  return (
    <StripeProvider apiKey="pk_test_6pRNASCoBOKtIshFeQd4XMUh">
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
