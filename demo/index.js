// @flow
/* eslint-disable no-console, react/no-multi-comp */
import React from 'react';
import ReactDOM from 'react-dom';

import type {StripeProps} from '../src/components/inject';

import {
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
  StripeProvider,
  Elements,
  injectStripe,
} from '../src/index';

const handleChange = (change) => {
  console.log('[change]', change);
};
const handleFocus = () => {
  console.log('[focus]');
};
const handleBlur = () => {
  console.log('[blur]');
};
const handleReady = () => {
  console.log('[ready]');
};

const createOptions = (fontSize: string) => {
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
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };
};

class _CardForm extends React.Component {
  props: {
    fontSize: string,
    stripe: StripeProps,
  };
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.stripe.createToken().then((payload) => console.log(payload));
  };
  handleSubmitWithSource = (ev) => {
    ev.preventDefault();

    this.props.stripe.createSource({
      type: 'card',
      currency: 'nok',
      amount: 100000,
    }).then((cardPayload) => {
      const cardSource = cardPayload.source;
      this.props.stripe.createSource({
        type: 'three_d_secure',
        amount: cardSource.amount,
        currency: cardSource.currency,
        three_d_secure: {
          card: cardSource.id,
        },
        redirect: {
          return_url: 'https://shop.example.com/crtA6B28E1',
        },
      }).then((threeDSecurePayload) => console.log(threeDSecurePayload.source));
    });
  };

  render() {
    return (
      <form onSubmit={this.handleSubmitWithSource}>
        <label>
          Card details
          <CardElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        <button>Pay</button>
      </form>
    );
  }
}
const CardForm = injectStripe(_CardForm);

class _SplitForm extends React.Component {
  props: {
    fontSize: string,
    stripe: StripeProps,
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.stripe.createToken().then((payload) => console.log(payload));
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Card number
          <CardNumberElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        <label>
          Expiration date
          <CardExpiryElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        <label>
          CVC
          <CardCVCElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        <label>
          Postal code
          <PostalCodeElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onReady={handleReady}
            {...createOptions(this.props.fontSize)}
          />
        </label>
        <button>Pay</button>
      </form>
    );
  }
}
const SplitForm = injectStripe(_SplitForm);

class Checkout extends React.Component {
  constructor() {
    super();
    this.state = {
      elementFontSize: window.innerWidth < 450 ? '14px' : '18px',
    };
    window.addEventListener('resize', () => {
      if (window.innerWidth < 450 && this.state.elementFontSize !== '14px') {
        this.setState({elementFontSize: '14px'});
      } else if (window.innerWidth >= 450 && this.state.elementFontSize !== '18px') {
        this.setState({elementFontSize: '18px'});
      }
    });
  }
  state: {
    elementFontSize: string,
  }

  render() {
    const {elementFontSize} = this.state;
    return (
      <div className="Checkout">
        <h1>Available Elements</h1>
        <Elements>
          <CardForm fontSize={elementFontSize} />
        </Elements>
        <Elements>
          <SplitForm fontSize={elementFontSize} />
        </Elements>
      </div>
    );
  }
}
const App = () => {
  return (
    <StripeProvider apiKey="pk_RXwtgk4Z5VR82S94vtwmam6P8qMXQ">
      <Checkout />
    </StripeProvider>
  );
};
ReactDOM.render(<App />, document.querySelector('.App'));
