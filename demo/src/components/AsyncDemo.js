import React, {Component} from 'react';
import {
  CardElement,
  injectStripe,
  StripeProvider,
  Elements,
} from 'react-stripe-elements';

// You can customize your Elements to give it the look and feel of your site.
const createOptions = () => {
  return {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        letterSpacing: '0.025em',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#c23d4b',
      },
    },
  };
};

class _CardForm extends Component {
  state = {
    errorMessage: '',
  };

  handleChange = ({error}) => {
    if (error) {
      this.setState({errorMessage: error.message});
    }
  };

  handleReady = () => {
    console.log('[ready]');
  };

  handleSubmit = (evt) => {
    evt.preventDefault();
    if (this.props.stripe) {
      this.props.stripe.createToken().then(this.props.handleResult);
    } else {
      console.log("Stripe.js hasn't loaded yet.");
    }
  };

  render() {
    return (
      <div className="CardDemo">
        <form onSubmit={this.handleSubmit.bind(this)}>
          <label>
            Card details
            {this.props.countdown > 0 ? (
              <span className="async-message">
                Loading Stripe in {this.props.countdown}...
              </span>
            ) : (
              ''
            )}
            {this.props.stripe ? (
              <CardElement
                onReady={this.handleReady}
                onChange={this.handleChange}
                {...createOptions()}
              />
            ) : (
              <div className="StripeElement loading" />
            )}
          </label>
          <div className="error" role="alert">
            {this.state.errorMessage}
          </div>
          <button disabled={!this.props.stripe}>Pay</button>
        </form>
      </div>
    );
  }
}

const CardForm = injectStripe(_CardForm);

export class AsyncDemo extends Component {
  constructor() {
    super();

    this.state = {
      stripe: null,
      countdown: 3,
    };
  }

  componentDidMount() {
    // componentDidMount only runs in a browser environment.
    // In addition to loading asynchronously, this code is safe to server-side render.

    // Remove our existing Stripe script to keep the DOM clean.
    document.getElementById('stripe-script').remove();
    // You can inject a script tag manually like this,
    // or you can use the 'async' attribute on the Stripe.js v3 <script> tag.
    const stripeJs = document.createElement('script');
    stripeJs.id = 'stripe-script';
    stripeJs.src = 'https://js.stripe.com/v3/';
    stripeJs.async = true;
    stripeJs.onload = () => {
      const countdown = setInterval(() => {
        this.setState({countdown: this.state.countdown - 1});
      }, 1000);
      // The setTimeout lets us pretend that Stripe.js took a long time to load
      // Take it out of your production code!
      setTimeout(() => {
        clearInterval(countdown);
        this.setState({
          stripe: window.Stripe(this.props.stripePublicKey),
        });
      }, 3000);
    };
    document.body && document.body.appendChild(stripeJs);
  }

  render() {
    return (
      <StripeProvider stripe={this.state.stripe}>
        <Elements>
          <CardForm
            countdown={this.state.countdown}
            handleResult={this.props.handleResult}
          />
        </Elements>
      </StripeProvider>
    );
  }
}
