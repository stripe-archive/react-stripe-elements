# Changelog

`react-stripe-elements` adheres to
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## v3.0.0 - 2019-04-17

### New Features

- added a [changelog](/CHANGELOG.md)
- added support for `stripe.handleCardPayment` and `stripe.createPaymentMethod`.
  These methods allow you to easily integrate Stripe's new Payment Intents API.
  Like `createToken` and `createSource`, these new methods will automatically
  find and use a corresponding Element when they are called.

  ```js
    stripe.createPaymentMethod(
      paymentMethodType: string,
      paymentMethodDetails: Object
    ): Promise<{error?: Object, paymentIntent?: Object}>

    stripe.handleCardPayment(
      clientSecret: string,
      paymentMethodDetails: Object
    ): Promise<{error?: Object, paymentIntent?: Object}>
  ```

  For more information, please review the Stripe Docs:

  - [`stripe.createPaymentMethod`](https://stripe.com/docs/stripe-js/reference#stripe-create-payment-method)
  - [`stripe.handleCardPayment`](https://stripe.com/docs/stripe-js/reference#stripe-handle-card-payment)
  - [Payment Intents API](https://stripe.com/docs/payments/payment-intents)
  - [Payment Methods API](https://stripe.com/docs/payments/payment-methods)

### Breaking Changes:

- If you were already using `handleCardPayment` or `createPaymentMethod` with
  `react-stripe-elements`, you should upgrade your integration. These methods
  will now automatically find and use valid Elements.

  #### Old Way

  ```js
  <CardElement
    ...
    onReady={this.handleReady}
  />

  handleReady = (element) => {
    this.setState({cardElement: element}) ;
  };

  let { paymentIntent, error } = await this.props.stripe.handleCardPayment(
    intent.client_secret, this.state.cardElement, {}
  );
  ```

  #### New Way

  ```js
  <CardElement />;

  let {paymentIntent, error} = await this.props.stripe.handleCardPayment(
    intent.client_secret,
    {}
  );
  ```

- Passing a beta flag to Stripe.js to use one of the PaymentIntents betas is not
  supported.

  #### Old Way

  ```js
  const stripe = window.Stripe(
    publicKey,
    {betas: ['payment_intent_beta_3']},
  );

  <StripeProvider stripe={stripe}>
    <YourCheckoutComponent>
  </StripeProvider>
  ```

  #### New Way

  ```js
  <StripeProvider apiKey={publicKey}>
    <YourCheckoutComponent>
  </StripeProvider>
  ```

- `PostalCodeElement` has been removed. We suggest that you build your own
  postal code input.

## v2.0.3 - 2019-01-25

### Bug Fixes

- Fixes a bug where the elements.update event was triggered far too often,
  incorrectly, when an Element was repeatedly rendered with the same options.

## v2.0.1 - 2018-07-11

### Bug Fixes

- The Element higher-order component now reports a proper displayName, which is
  more useful for debugging. (Thanks @emilrose!)

## v2.0.0 - 2018-06-01

### New Features

- Support for the `IbanElement` and `IdealBankElement`.

### Breaking Changes

- `stripe.createSource` now requires the Source type be passed in.
  - For example, if you previously called
    `stripe.createSource({ name: 'Jenny Rosen' })`, you now must use
    `stripe.createSource({ type: 'card', name: 'Jenny Rosen' })`.
- elementRef is no longer a valid prop you can pass to an `<Element />`. Use
  onReady instead to get a reference to the underlying Element instance.

## v1.7.0 - 2018-05-31

### Deprecations

- `createSource` automatically infers the type of Source to create based on
  which Elements are in use. This behavior is now deprecated, and the Source
  type will be required in version 2.0.0.

## v1.6.0 - 2018-03-05

### Deprecations

- The elementRef callback is deprecated and will be removed in version 2.0.0.
  Use onReady instead, which is the exact same.

### Bug Fixes

- The id prop from v1.5.0 was absent from the `PaymentRequestButtonElement`.
  Now, the `PaymentRequestButtonElement` behaves like all the other \*Element
  components.

## v1.5.0 - 2018-03-02

### New Features

- (#177 / #178) The \*Element classes learned a new id prop. This can be used to
  set the ID of the underlying DOM Element.

## v1.4.1 - 2018-01-22

### Bug Fixes

- Fixed a TODO in an error message emitted by Provider.js.

## v1.4.0 - 2018-01-17

### Bug Fixes

- Modify build pipeline to fix issues with IE9 and IE10.

## v1.3.2 - 2018-01-11

### Bug Fixes

- Fix split Element token creation for async codepath. (#148)

## v1.3.1 - 2018-01-10

### Bug Fixes

- Fixes a regression introduced by v1.3.0 (#146).

## v1.3.0 - 2018-01-09

### New Features

- Loading Stripe.js and react-stripe-elements asynchronously
- Rendering react-stripe-elements on the server
- Passing a custom stripe instance to `StripeProvider`
  - For an overview of how this works, see the Advanced integrations section.

## v1.2.1 - 2017-11-21

### Bug Fixes

- Fixed a bug where using pure components under the `<Elements>` component would
  lead to an error.

## v1.2.0 - 2017-10-12

### New Features

- The PaymentRequestButtonElement now accepts an onClick prop that maps to the
  `element.on('click')` event.

## v1.1.1 - 2017-10-11

### Bug Fixes

- The instance of Stripe provided by StripeProvider is now consistent across
  StripeProvider usages across your application, as long as you're passing in
  the same API key & configuration.

## v1.1.0 - 2017-10-05

### New Features

- We've added a new component! You can now use `<PaymentRequestButtonElement />`
  which wraps up `elements.create('paymentRequestButton')` in a React component.

## v1.0.0 - 2017-09-18

### New Features

- Update dependencies
- Improve test coverage
- Allow React 16 as peer dependency

## v0.1.0 - 2017-09-13

### New Features

- You can now pass the `withRef` option to `injectStripe` to make the wrapped
  component instance available via `getWrappedInstance()`

## v0.0.8 - 2017-08-21

### New Features

- Render \*Element components with div instead of span (#61)

## v0.0.7 - 2018-08-03

### New Features

- You can now pass `className` to `<*Element>` (e.g.
  <CardElement className="foo"> and it will be passed down to the element
  container DOM element.

## v0.0.6 - 2017-07-25

### Bug Fixes

- Bugfix for collapsed Elements: #45 #48

## v0.0.5 - 2017-07-20

### Bug Fixes

- Same as v0.0.3 but fixed corrupted npm upload.

## v0.0.3 - 2017-07-20

### Bug Fixes

- Bug fixes for: #29, #40

## v0.0.2 - 05-04-2017

### New Features

Initial release! Support for:

- StripeProvider
- Elements
- injectStripe
- Individual elements:
  - CardElement
  - CardNumberElement
  - CardExpiryElement
  - CardCVCElement
  - PostalCodeElement
