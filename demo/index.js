import React from 'react';
import ReactDOM from 'react-dom';

import {
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
  StripeProvider,
  injectStripe
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
const handleError = (error) => {
  console.log('[error]', error);
};
const handleComplete = () => {
  console.log('[complete]');
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

const CardForm = injectStripe(class extends React.Component {
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
            onError={handleError}
            onComplete={handleComplete}
            onReady={handleReady}
            {...options}
          />
        </label>
        <button>Pay</button>
      </form>
    );
  }
});

const SplitForm = injectStripe(class extends React.Component {
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
            onError={handleError}
            onComplete={handleComplete}
            onReady={handleReady}
            {...options}
          />
          <CardExpiryElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onError={handleError}
            onComplete={handleComplete}
            onReady={handleReady}
            {...options}
          />
          <CardCVCElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onError={handleError}
            onComplete={handleComplete}
            onReady={handleReady}
            {...options}
          />
          <PostalCodeElement
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onError={handleError}
            onComplete={handleComplete}
            onReady={handleReady}
            {...options}
          />
        </label>
        <button>Pay</button>
      </form>
    );
  }
});

const Checkout = class extends React.Component {
  render() {
    return (
      <div>
        <StripeProvider apiKey="pk_RXwtgk4Z5VR82S94vtwmam6P8qMXQ">
          <CardForm />
        </StripeProvider>
        <StripeProvider apiKey="pk_RXwtgk4Z5VR82S94vtwmam6P8qMXQ">
          <SplitForm />
        </StripeProvider>
      </div>
    );
  }
};
const App = (props) => {
  return (
    <Checkout />
  );
};
ReactDOM.render(<App />, document.querySelector('.App'));