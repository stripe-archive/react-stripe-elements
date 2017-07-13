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
};

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
};
