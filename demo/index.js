/* eslint-disable no-console, react/no-multi-comp */
// @flow
import React from 'react';
import ReactDOM from 'react-dom';

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

const options = {
  style: {
    base: {
      fontSize: '20px',
    },
  },
};

class _CardForm extends React.Component {
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.stripe.createToken().then((payload) => console.log(payload));
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <CardElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onReady={handleReady}
            {...options}
          />
        </label>
        <button>Pay</button>
      </form>
    );
  }
}
const CardForm = injectStripe(_CardForm);

class _SplitForm extends React.Component {
  handleChange = (change) => {
    console.log('[change]', change);
  }
  handleFocus = () => {
    console.log('[focus]');
  }
  handleBlur = () => {
    console.log('[blur]');
  }
  handleError = (error) => {
    console.log('[error]', error);
  }
  handleComplete = () => {
    console.log('[complete]');
  }
  handleReady = () => {
    console.log('[ready]');
  }
  handleSubmit = (ev) => {
    ev.preventDefault();
    this.props.stripe.createToken().then((payload) => console.log(payload));
  }
  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          <CardNumberElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onReady={handleReady}
            {...options}
          />
          <CardExpiryElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onReady={handleReady}
            {...options}
          />
          <CardCVCElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onReady={handleReady}
            {...options}
          />
          <PostalCodeElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onReady={handleReady}
            {...options}
          />
        </label>
        <button>Pay</button>
      </form>
    );
  }
}
const SplitForm = injectStripe(_SplitForm);

class Checkout extends React.Component {
  render() {
    return (
      <div>
        <Elements>
          <CardForm />
        </Elements>
        <Elements>
          <SplitForm />
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
