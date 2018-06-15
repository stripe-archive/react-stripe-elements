import React, {Component} from 'react';
import {
  injectStripe,
  PaymentRequestButtonElement,
  StripeProvider,
  Elements,
} from 'react-stripe-elements';

class _PaymentRequestForm extends Component {
  constructor(props) {
    super(props);

    // For full documentation of the available paymentRequest options, see:
    // https://stripe.com/docs/stripe.js#the-payment-request-object
    const paymentRequest = props.stripe.paymentRequest({
      country: 'US',
      currency: 'usd',
      total: {
        label: 'Demo total',
        amount: 1000,
      },
      // Requesting the payer’s name, email, or phone is optional, but recommended.
      // It also results in collecting their billing address for Apple Pay.
      requestPayerName: true,
      requestPayerEmail: true,
    });

    paymentRequest.on('token', ({complete, token, ...data}) => {
      props.handleResult({paymentRequest: {token, data}});
      complete('success');
    });

    paymentRequest.canMakePayment().then((result) => {
      this.setState({canMakePayment: !!result});
    });

    this.state = {
      canMakePayment: false,
      paymentRequest,
    };
  }

  render() {
    return this.state.canMakePayment ? (
      <PaymentRequestButtonElement
        paymentRequest={this.state.paymentRequest}
        className="PaymentRequestButton"
        style={{
          // For more details on how to style the Payment Request Button, see:
          // https://stripe.com/docs/elements/payment-request-button#styling-the-element
          paymentRequestButton: {
            theme: 'light',
            height: '64px',
          },
        }}
      />
    ) : (
      <p>
        Either your browser does not support the Payment Request
        API or you do not have a saved payment method. To try out the Payment
        Request Button, switch to one of{' '}
        <a href="https://stripe.com/docs/stripe-js/elements/payment-request-button#testing">
          the supported browsers
        </a>, and make sure you have a saved payment method.
      </p>
    );
  }
}

const PaymentRequestForm = injectStripe(_PaymentRequestForm);

export class PaymentRequestDemo extends Component {
  render() {
    return (
      <StripeProvider apiKey={this.props.stripePublicKey}>
        <Elements>
          <PaymentRequestForm handleResult={this.props.handleResult} />
        </Elements>
      </StripeProvider>
    );
  }
}
