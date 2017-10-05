# Stripe Elements for React

React components that help you quickly add Stripe Elements to your React app.

[![build status](https://img.shields.io/travis/stripe/react-stripe-elements/master.svg?style=flat-square)](https://travis-ci.org/stripe/react-stripe-elements)
[![npm version](https://img.shields.io/npm/v/react-stripe-elements.svg?style=flat-square)](https://www.npmjs.com/package/react-stripe-elements)

This project is a thin React wrapper around [Stripe.js](https://stripe.com/docs/stripe.js)
and [Stripe Elements](https://stripe.com/docs/elements). It allows you to add Elements
to any React app, and manages the state and lifecycle of Elements for you.

The [Stripe.js / Stripe Elements API reference](https://stripe.com/docs/elements/reference)
goes into more detail on the various customization options for Elements (e.g. styles, fonts).

## Getting started

### Installation

#### First, install `react-stripe-elements`.

Using yarn:

    yarn add react-stripe-elements

Using npm:

    npm install --save react-stripe-elements

Using UMD build (exports a global `ReactStripeElements` object):

```html
<script src="https://unpkg.com/react-stripe-elements@latest/dist/react-stripe-elements.min.js"></script>
```

#### Then, load Stripe.js in your application:

```html
<script src="https://js.stripe.com/v3/"></script>
```

You're good to go!

### The Stripe context (`StripeProvider`)

In order for your application to have access to [the Stripe object](https://stripe.com/docs/elements/reference#the-stripe-object),
let's add `StripeProvider` to our root React App component:

```js
// index.js
import React from 'react';
import {render} from 'react-dom';
import {StripeProvider} from 'react-stripe-elements';

import MyStoreCheckout from './MyStoreCheckout';

const App = () => {
  return (
    <StripeProvider apiKey="pk_test_12345">
      <MyStoreCheckout />
    </StripeProvider>
  );
};

render(<App />, document.getElementById('root'));
```

### Element groups (`Elements`)

Next, when you're building components for your checkout form, you'll want to wrap the `Elements` component around your `form`.
This groups the set of Stripe Elements you're using together, so that we're able to pull data from groups of Elements when
you're tokenizing.

```js
// MyStoreCheckout.js
import React from 'react';
import {Elements} from 'react-stripe-elements';

import CheckoutForm from './CheckoutForm';

class MyStoreCheckout extends React.Component {
  render() {
    return (
      <Elements>
        <CheckoutForm />
      </Elements>
    );
  }
}

export default MyStoreCheckout;
```

### Setting up your payment form (`injectStripe`)

Use the `injectStripe` [Higher-Order Component][hoc] (HOC) to build your payment
form components in the `Elements` tree. The [Higher-Order Component][hoc]
pattern in React can be unfamiliar to those who've never seen it before, so
consider reading up before continuing. The `injectStripe` HOC provides the
`this.props.stripe` property that manages your `Elements` groups. You can call
`this.props.stripe.createToken` within a component that has been injected to
submit payment data to Stripe.

[hoc]: https://facebook.github.io/react/docs/higher-order-components.html

> :warning: NOTE `injectStripe` cannot be used on the same element that renders
> the `Elements` component; it must be used on the child component of
> `Elements`. `injectStripe` *returns a wrapped component* that needs to sit
> under `<Elements>` but above any code where you'd like to access
> `this.props.stripe`.

```js
// CheckoutForm.js
import React from 'react';
import {injectStripe} from 'react-stripe-elements';

import AddressSection from './AddressSection';
import CardSection from './CardSection';

class CheckoutForm extends React.Component {
  handleSubmit = (ev) => {
    // We don't want to let default form submission happen here, which would refresh the page.
    ev.preventDefault();

    // Within the context of `Elements`, this call to createToken knows which Element to
    // tokenize, since there's only one in this group.
    this.props.stripe.createToken({name: 'Jenny Rosen'}).then(({token}) => {
      console.log('Received Stripe token:', token);
    });

    // However, this line of code will do the same thing:
    // this.props.stripe.createToken({type: 'card', name: 'Jenny Rosen'});
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <AddressSection />
        <CardSection />
        <button>Confirm order</button>
      </form>
    );
  }
}

export default injectStripe(CheckoutForm);
```

### Using individual `*Element` components

Now, you can use individual `*Element` components, such as `CardElement`, to build your form.

```js
// CardSection.js
import React from 'react';
import {CardElement} from 'react-stripe-elements';

class CardSection extends React.Component {
  render() {
    return (
      <label>
        Card details
        <CardElement style={{base: {fontSize: '18px'}}} />
      </label>
    );
  }
};

export default CardSection;
```

### Using the `PaymentRequestButtonElement`

The [Payment Request Button](https://stripe.com/docs/elements/payment-request-button) lets you collect payment and address information from your customers using Apple Pay and the Payment Request API.

To use the `PaymentRequestButtonElement` you need to first create a [`PaymentRequest` Object](https://stripe.com/docs/stripe.js#the-payment-request-object). You can then conditionally render the `PaymentRequestButtonElement` based on the result of `paymentRequest.canMakePayment` and pass the `PaymentRequest` Object as a prop.

```js
class PaymentRequestForm extends React.Component {
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
    });

    paymentRequest.on('token', ({complete, token, ...data}) => {
      console.log('Received Stripe token: ', token);
      console.log('Received customer information: ', data);
      complete('success');
    });

    paymentRequest.canMakePayment().then(result => {
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
    ) : null;
  }
}
export default injectStripe(PaymentRequestForm);
```

## Component reference

### `<StripeProvider>`

All applications using `react-stripe-elements` must use the `<StripeProvider>`  component, which sets up the Stripe context for a component tree.
`react-stripe-elements` uses the provider pattern (which is also adopted by tools like [`react-redux`](https://github.com/reactjs/react-redux) and [`react-intl`](https://github.com/yahoo/react-intl)) to scope a Stripe context to a tree of components. This allows configuration like your API key to be provided at the root of a component tree. This context is then made available to the `<Elements>` component and individual `<*Element>` components that we provide.

An integration usually wraps the `<StripeProvider>` around the application’s root component. This way, your entire application has the configured Stripe context.

#### Props shape

This component accepts all `options` that can be passed into `Stripe(apiKey, options)` as props.

```js
type StripeProviderProps = {
  apiKey: string,
};
```


### `<Elements>`

The `Elements` component wraps groups of Elements that belong together. In most cases, you want to wrap this around your checkout form.

#### Props shape

This component accepts all `options` that can be passed into `stripe.elements(options)` as props.

```js
type ElementsProps = {
  locale?: string,
  fonts?: Array<Object>,
  // The full specification for `elements()` options is here: https://stripe.com/docs/elements/reference#elements-options
};
```

### `<*Element>` components

These components display the UI for Elements, and must be used within `StripeProvider` and `Elements`.

#### Available components

(More to come!)

- `CardElement`
- `CardNumberElement`
- `CardExpiryElement`
- `CardCVCElement`
- `PostalCodeElement`
- `PaymentRequestButtonElement`

#### Props shape

These components accept all `options` that can be passed into `elements.create(type, options)` as props.

```js
type ElementProps = {
  className?: string,
  elementRef?: (StripeElement) => void,

  // For full documentation on the events and payloads below, see:
  // https://stripe.com/docs/elements/reference#element-on
  onChange?: (changeObject: Object) => void,
  onReady?: () => void,
  onFocus?: () => void,
  onBlur?: () => void,
};
```

The props for the `PaymentRequestButtonElement` are:

```js
type PaymentRequestButtonProps = {
  paymentRequest: StripePaymentRequest,
  className?: string,
  elementRef?: (StripeElement) => void,

  onReady?: () => void,
  onFocus?: () => void,
  onBlur?: () => void,
};
```

### `injectStripe` HOC

```
function injectStripe(
  WrappedComponent: ReactClass,
  options?: {
    withRef?: boolean = false,
  }
): ReactClass;
```
Components that need to initiate Source or Token creations (e.g. a checkout form component) can access `stripe.createToken` via props of any component returned by the `injectStripe` HOC factory.

If the `withRef` option is set to `true`, the wrapped component instance will be available with the `getWrappedInstance()` method of the wrapper component. This feature can not be used if the wrapped component is a stateless function component.

#### Example

```js
const StripeCheckoutForm = injectStripe(CheckoutForm);
```

The following props will be available to this component:

```js
type FactoryProps = {
  stripe: {
    createToken: (tokenParameters: {type?: string}) => Promise<{token?: Object, error?: Object}>,
    // and other functions available on the `stripe` object,
    // as officially documented here: https://stripe.com/docs/elements/reference#the-stripe-object
  },
};
```

## Troubleshooting

`react-stripe-elements` may not work properly when used with components that implement `shouldComponentUpdate`. `react-stripe-elements` relies heavily on React's `context` feature and `shouldComponentUpdate` does not provide a way to take context updates into account when deciding whether to allow a re-render. These components can block context updates from reaching `react-stripe-element` components in the tree.

For example, when using `react-stripe-elements` together with [`react-redux`](https://github.com/reactjs/react-redux) doing the following will not work:
```js
const Component = connect()(injectStripe(_Component));
```
In this case, the context updates originating from the `StripeProvider` are not reaching the components wrapped inside the `connect` function. Therefore, `react-stripe-elements` components deeper in the tree break. The reason is that the `connect` function of `react-redux` [implements `shouldComponentUpdate`](https://github.com/reactjs/react-redux/blob/master/docs/troubleshooting.md#my-views-arent-updating-when-something-changes-outside-of-redux) and blocks re-renders that are triggered by context changes outside of the connected component.

There are two ways to prevent this issue:

1. Change the order of the functions to have `injectStripe` be the outermost one:
  ```js
  const Component = injectStripe(connect()(_CardForm));
  ```
  This works, because `injectStripe` does not implement `shouldComponentUpdate` itself, so context updates originating from the `redux` `Provider` will still reach all components.

2. You can use the [`pure: false`](https://github.com/reactjs/react-redux/blob/master/docs/api.md#connectmapstatetoprops-mapdispatchtoprops-mergeprops-options) option for `redux-connect`:
  ```js
  const Component = connect(mapStateToProps, mapDispatchToProps, mergeProps, {
    pure: false,
  })(injectStripe(_CardForm));
  ```

## Development

Install dependencies:

    yarn install

Run the demo:

    yarn run demo

Run the tests:

    yarn run test

Build:

    yarn run build

We use [prettier](https://github.com/prettier/prettier) for code formatting:

    yarn run prettier

Checks:

    yarn run lint
    yarn run flow
