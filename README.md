# react-stripe-elements

## Getting started

### Installation

First, install `react-stripe-elements` :

    yarn add react-stripe-elements

Load Stripe.js in your application:

```html
<script src="https://js.stripe.com/v3"></script>
```

You’re good to go!

### The Stripe context

In order for your application to have access to the Stripe object, let's add `StripeProvider` to our root React App component:

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

### Element groups

Next, when you're building components for your checkout form, you'll want to use the `Elements` component to wrap your form. This groups the set of Stripe Elements you're using together.

```js
// MyStoreCheckout.js
import React from 'react';
import {Elements} from 'react-stripe-elements';
import {AddressForm} from './AddressForm';
import {CardForm} from './CardForm';

const MyStoreCheckout = (props) => {
  return (
    <Elements>
      <AddressForm />
      <CardForm />
    </Elements>
  );
}

export default MyStoreCheckout;
```

### Building your form

Use the `injectStripe` HOC to build components in the `Elements` tree that need to use the individual `Element` components to create a Source or a Token:

```js
// CardForm.js
import React from 'react';
import {CardElement, injectStripe} from 'react-stripe-elements';

class CardForm extends React.Component {
  handleSubmit = (ev) => {
    // We don't want to let default form submission happen here, which would refresh the page.
    ev.preventDefault();

    // Within the context of `Elements`, this call to createToken knows which Element to
    // sourcify, since there's only one in this group.
    this.props.stripe.createToken({owner: {name: 'Jenny Rosen'}});

    // However, this line of code will do the same thing:
    // this.props.stripe.createToken({type: 'card', owner: {name: 'Jenny Rosen'}});
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Card details
          <CardElement style={{base: {fontSize: '18px'}}} />
        </label>
        <button>Pay</button>
      </form>
    );
  }
};

export default injectStripe(CardForm);
```

## Component reference

### `<StripeProvider>`

All applications using react-stripe-elements must use the `<StripeProvider>`  component, which sets up the Stripe context for a component tree.
react-stripe-elements uses the provider pattern (which is also adopted by tools like react-redux and react-intl) to scope a Stripe context to a tree of components. This allows configuration like your API key, the current locale, and common font resources to be proved at the root of a component tree. This context is then made available to the `<*Element>` components that we provide.

An integration usually wraps the `<StripeProvider>` around the application’s root component. This way, your entire application has the configured Stripe context.

#### Props shape:

This component accepts all `options` that can be passed into `Stripe(apiKey, options)` as props.

```js
type StripeProviderProps = {
  apiKey: string,
};
```


### `<Elements>`

The `Elements` component wraps groups of Elements that belong together. In most cases, you want to wrap this around your checkout form.

#### Props shape:

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

#### Props shape:

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
};
```

### `injectStripe` HOC

Components that need to initiate Source or Token creations (e.g. a checkout form component) can access `stripe.createToken` via props of any component returned by the `injectStripe` HOC factory.

#### Example:

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

Run the demo:

    yarn run demo

Run the tests:

    yarn run test

Build:

    yarn run build

Checks:

    yarn run lint
    yarn run flow
