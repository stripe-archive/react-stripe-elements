# Stripe Elements for React

React components that help you quickly add Stripe Elements to your React app.

[![build status](https://img.shields.io/travis/stripe/react-stripe-elements/master.svg?style=flat-square)](https://travis-ci.org/stripe/react-stripe-elements)
[![npm version](https://img.shields.io/npm/v/react-stripe-elements.svg?style=flat-square)](https://www.npmjs.com/package/react-stripe-elements)

This project is a thin React wrapper around [Stripe.js](https://stripe.com/docs/stripe.js)
and [Stripe Elements](https://stripe.com/docs/elements). It allows you to add Elements
to any React app, and manages the state and lifecycle of Elements for you.

The [Stripe.js / Stripe Elements API reference](https://stripe.com/docs/elements/reference)
goes into more detail on the various customization options for Elements (e.g. styles, fonts).

> This project is currently in beta. The API presented below may undergo significant changes until we hit a stable release.

## Getting started

### Installation

First, install `react-stripe-elements`.

Using yarn:

    yarn add react-stripe-elements

Using npm:

    npm install --save react-stripe-elements

Then, load Stripe.js in your application:

```html
<head>
  <script src="https://js.stripe.com/v3/"></script>
  <!-- Your other scripts live here. -->
</head>
```

You're good to go!

#### Loading Stripe.js asynchronously (not recommended)

We recommend loading Stripe.js on every page to best leverage Stripe’s advanced fraud functionality.
This allows Stripe to detect anomalous behavior that may be indicative of fraud as users browse your web site.

However, if you're loading Stripe.js yourself asynchronously, you won't be able to use some of the helpers below, which assume that the `window.Stripe` object is immediately available.
Instead, you'll want to follow the instructions (here)[#loading-stripejs-asynchronously].

### The Stripe context (`StripeProvider`)

In order for your application to have access to [the Stripe object](https://stripe.com/docs/elements/reference#the-stripe-object),
let's add `StripeProvider` to our root React App component:

```js
// index.js
import React from 'react';
import {StripeProvider} from 'react-stripe-elements';

import MyStoreCheckout from './MyStoreCheckout';

const App = () => {
  return (
    <StripeProvider apiKey="pk_test_12345">
      <MyStoreCheckout />
    </StripeProvider>
  );
};

ReactDOM.render(<App />, document.getElementById('root'));
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

Use the `injectStripe` Higher-Order Component (HOC) to build your payment form components in the `Elements` tree. This HOC injects the `stripe`
instance that manages your `Elements` groups. You can call `createToken` on the injected `stripe` instance to submit
payment data to Stripe.

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

### Check out the demo!

It's (here)[https://github.com/stripe/react-stripe-elements/tree/master/demo].

### Loading Stripe.js asynchronously

If you're loading Stripe.js yourself asynchronously, `window.Stripe` won't be available to the `StripeProvider` immediately, so you won't be able to use the helpers documented above.

Instead, you'll want to do something like this:

```js
// AsyncCheckoutForm.js
import React from 'react';
import {CardElement} from 'react-stripe-elements';

class AsyncCheckoutForm extends React.Component {
  constructor() {
    super();
    this.state = {
      stripe: null,
    };

    // This is something you'll need to implement:
    waitForStripe().then(() => {
      // You will probably want to keep references to these objects if you're using them in other parts of your form:
      const stripe = Stripe('pk_test_12345');
      const elements = stripe.elements();

      this.setState({stripe, elements});
    });
  }

  handleElementRef = (element) => {
    this._cardElement = element;
  }

  handleSubmit = (ev) => {
    // We don't want to let default form submission happen here, which would refresh the page.
    ev.preventDefault();

    this.state.stripe.createToken(this._cardElement, {name: 'Jenny Rosen'});
  }

  render() {
    if (this.state.elements) {
      return (
        <form onSubmit={this.handleSubmit}>
          <label>
            Card details
            <CardElement
              elements={this.state.elements}
              elementRef={this.handleElementRef}
              style={{base: {fontSize: '18px'}}}
            />
          </label>
          <button>Confirm order</button>
        </form>
      );
    } else {
      return (
        <div>
          Loading...
        </div>
      );
    }
  }
};

export default AsyncCheckoutForm;
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

#### Props shape

These components accept all `options` that can be passed into `elements.create(type, options)` as props.

```js
type ElementProps = {
  elementRef?: (StripeElement) => void,

  // For full documentation on the events and payloads below, see:
  // https://stripe.com/docs/elements/reference#element-on
  onChange?: (changeObject: Object) => void,
  onReady?: () => void,
  onFocus?: () => void,
  onBlur?: () => void,

  // Only applicable if you are asynchronously loading Stripe.js:
  elements: Elements,
};
```

### `injectStripe` HOC

Components that need to initiate Source or Token creations (e.g. a checkout form component) can access `stripe.createToken` via props of any component returned by the `injectStripe` HOC factory.

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

## Development

Install dependencies:

    yarn install

Run the demo:

    yarn run demo

Run the tests:

    yarn run test

Build:

    yarn run build

Checks:

    yarn run lint
    yarn run flow
