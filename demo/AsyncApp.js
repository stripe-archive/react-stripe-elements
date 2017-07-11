// @flow
/* eslint-disable no-console, react/no-multi-comp */
import React from 'react';

import {
  CardElement,
} from '../src/index';

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

// We load Stripe immediately, so we'll add some delay.
const waitForStripe = () => {
  return new Promise((resolve) => {
    setTimeout(
      () => resolve(window.Stripe('pk_RXwtgk4Z5VR82S94vtwmam6P8qMXQ')),
      5000
    );
  });
};

class Checkout extends React.Component {
  constructor() {
    super();
    this.state = {
      elementFontSize: window.innerWidth < 450 ? '14px' : '18px',
    };

    // Wait for Stripe to load!
    waitForStripe().then((stripe) =>
      this.setState({stripe, elements: stripe.elements()})
    );

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
  state: {
    elementFontSize: string,
    elements?: Object,
    stripe?: Object,
  };
  _cardElement: ?Object

  handleSubmit = (ev) => {
    ev.preventDefault();
    this.state.stripe && this.state.stripe
      .createToken(this._cardElement)
      .then((payload) => console.log(payload));
  };

  saveElementRef = (element) => (this._cardElement = element);

  render() {
    const {elementFontSize} = this.state;
    return (
      <div className="Checkout">
        <h1>Asynchronous example</h1>
        {this.state.elements
          ? <form onSubmit={this.handleSubmit}>
            <label>
                Card details
                <CardElement
                  elements={this.state.elements}
                  elementRef={this.saveElementRef}
                  {...createOptions(elementFontSize)}
                />
            </label>
            <button>Pay</button>
          </form>
          : 'Loading...'}
      </div>
    );
  }
}
const AsyncApp = () => {
  return <Checkout />;
};

export default AsyncApp;
