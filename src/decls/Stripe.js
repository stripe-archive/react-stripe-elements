// @flow
declare type ElementShape = {
  mount: Function,
  destroy: () => ElementShape,
  on: (event: string, handler: Function) => ElementShape,
  update: (options: Object) => ElementShape,
};

declare type ElementsShape = {
  create: (type: string, options: Object) => ElementShape,
};

declare type StripeShape = {
  elements: (options: Object) => ElementsShape,
  createSource: (element: ElementShape | Object, options: ?Object) => Promise<{source?: Object, error?: Object}>,
  createToken: (type: string | ElementShape, options: Object) => Promise<{token?: Object, error?: Object}>,
};

