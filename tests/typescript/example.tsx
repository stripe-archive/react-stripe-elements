import * as React from 'react';
import {StripeProvider} from '../../';

// index.tsx
const App = () => {
  return (
    <StripeProvider apiKey="pk_test_12345">
      <MyStoreCheckout />
    </StripeProvider>
  );
};

// MyStoreCheckout.tsx
import {Elements} from '../../';
class MyStoreCheckout extends React.Component<{}, {}> {
  render() {
    return (
      <Elements>
        <CheckoutForm foo="bar" />
      </Elements>
    );
  }
}

// CheckoutForm.tsx
import {
  injectStripe,
  StripeProps,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
} from '../../';

type CheckoutFormProps = {
  foo: string;
};
type Props = CheckoutFormProps & StripeProps;

class _CheckoutForm extends React.Component<Props, {}> {
  handleSubmit = (ev: React.FormEvent<HTMLFormElement>) => {
    // We don't want to let default form submission happen here, which would refresh the page.
    ev.preventDefault();

    // Within the context of `Elements`, this call to createToken knows which Element to
    // tokenize, since there's only one in this group.
    this.props.stripe.createToken({name: 'Jenny Rosen'}).then(({token, error}) => {
      if (token) {
        console.log('Received Stripe token:', token.id);
      } else if (error) {
        console.log('Error:', error.message);
      }
    });
  }

  render() {
    const style = {
      base: {
        color: '#303238',
        fontSize: '16px',
        lineHeight: '48px',
        fontSmoothing: 'antialiased',
        '::placeholder': {
          color: '#ccc',
        },
      },
      invalid: {
        color: '#e5424d',
        ':focus': {
          color: '#303238',
        },
      },
    };

    return (
      <form onSubmit={this.handleSubmit}>
        <button>Confirm order</button>
        <CardElement value={{postalCode: "94110"}} style={style} iconStyle="solid" hideIcon={ false } hidePostalCode />
        <CardNumberElement style={style} />
        <PostalCodeElement style={style} value="94607" />
      </form>
    );
  }
}

// Without subtraction/difference types, it is hard to have the HOC
// specify that the downstream component has had its StripeProps fulfilled.
// See: https://github.com/Microsoft/TypeScript/issues/6895
const CheckoutForm = injectStripe(_CheckoutForm) as React.ComponentClass<CheckoutFormProps>;

// This also works, but also requires the downstream component to manually
// specify `Props - StripeProps`.
const AlternativeCheckoutForm = injectStripe<CheckoutFormProps>(_CheckoutForm);

const render = () => (
  <div>
    <CheckoutForm foo="bar" />
    <AlternativeCheckoutForm foo="baz" />
  </div>
);
