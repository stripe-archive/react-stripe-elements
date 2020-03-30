// @flow
/* global StripeShape:false, ElementsShape:false, ElementShape:false */
// ^For https://github.com/gajus/eslint-plugin-flowtype/issues/84

type MixedObject = {[string]: mixed};

declare type ElementShape = {
  mount: Function,
  destroy: () => ElementShape,
  on: (event: string, handler: Function) => ElementShape,
  update: (options: MixedObject) => ElementShape,
};

declare type ElementsShape = {
  create: (type: string, options: MixedObject) => ElementShape,
  getElement: (type: string) => null | ElementShape,
};

type ConfirmSetupFn = (
  clientSecret: string,
  options?: mixed
) => Promise<{setupIntent?: MixedObject, error?: MixedObject}>;

type ConfirmPaymentFn = (
  clientSecret: string,
  options?: mixed
) => Promise<{paymentIntent?: MixedObject, error?: MixedObject}>;

declare type StripeShape = {
  elements: (options: MixedObject) => ElementsShape,
  createSource: (
    element: ElementShape | MixedObject,
    options: ?{}
  ) => Promise<{source?: MixedObject, error?: MixedObject}>,
  createToken: (
    type: string | ElementShape,
    options: mixed
  ) => Promise<{token?: MixedObject, error?: MixedObject}>,
  createPaymentMethod: (
    type: mixed,
    element?: ElementShape | MixedObject,
    data?: mixed
  ) => Promise<{paymentMethod?: MixedObject, error?: MixedObject}>,
  handleCardPayment: (
    clientSecret: string,
    element: mixed,
    options: mixed
  ) => Promise<{paymentIntent?: MixedObject, error?: MixedObject}>,
  handleCardSetup: (
    clientSecret: string,
    element: mixed,
    options: mixed
  ) => Promise<{setupIntent?: MixedObject, error?: MixedObject}>,
  confirmCardPayment: ConfirmPaymentFn,
  confirmCardSetup: ConfirmSetupFn,
  confirmIdealPayment: ConfirmPaymentFn,
  confirmSepaDebitPayment: ConfirmPaymentFn,
  confirmSepaDebitSetup: ConfirmSetupFn,
  _registerWrapper: (wrapper: {|
    name: string,
    version: string | null,
  |}) => void,
};
