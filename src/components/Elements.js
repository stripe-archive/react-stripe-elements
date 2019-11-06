// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {type ProviderContext, providerContextTypes} from './Provider';

export type ElementsList = Array<{
  element: ElementShape,
  impliedTokenType?: string,
  impliedSourceType?: string,
  impliedPaymentMethodType?: string,
}>;
export type ElementsLoadListener = (ElementsShape) => void;

type Props = {
  children?: any,
};

type State = {
  registeredElements: ElementsList,
};

export type InjectContext = {
  getRegisteredElements: () => ElementsList,
  elements: ElementsShape | null,
};

export const injectContextTypes = {
  getRegisteredElements: PropTypes.func.isRequired,
  elements: PropTypes.object,
};

export type ElementContext = {
  addElementsLoadListener: (ElementsLoadListener) => void,
  registerElement: (
    element: ElementShape,
    impliedTokenType: ?string,
    impliedSourceType: ?string,
    impliedPaymentMethodType: ?string
  ) => void,
  unregisterElement: (element: ElementShape) => void,
};

export const elementContextTypes = {
  addElementsLoadListener: PropTypes.func.isRequired,
  registerElement: PropTypes.func.isRequired,
  unregisterElement: PropTypes.func.isRequired,
};

type ChildContext = InjectContext & ElementContext;

export default class Elements extends React.Component<Props, State> {
  static childContextTypes = {
    ...injectContextTypes,
    ...elementContextTypes,
  };
  static contextTypes = providerContextTypes;
  static defaultProps = {
    children: null,
  };

  constructor(props: Props, context: ProviderContext) {
    super(props, context);

    const {children, ...options} = this.props;

    if (this.context.tag === 'sync') {
      this._elements = this.context.stripe.elements(options);
    }

    this.state = {
      registeredElements: [],
    };
  }

  getChildContext(): ChildContext {
    return {
      addElementsLoadListener: (fn: ElementsLoadListener) => {
        // Return the existing elements instance if we already have one.
        if (this.context.tag === 'sync') {
          // This is impossible, but we need to make flow happy.
          if (!this._elements) {
            throw new Error(
              'Expected elements to be instantiated but it was not.'
            );
          }

          fn(this._elements);
        } else {
          this.context.addStripeLoadListener((stripe: StripeShape) => {
            if (this._elements) {
              fn(this._elements);
            } else {
              const {children, ...options} = this.props;
              this._elements = stripe.elements(options);
              fn(this._elements);
            }
          });
        }
      },
      registerElement: this.handleRegisterElement,
      unregisterElement: this.handleUnregisterElement,
      getRegisteredElements: () => this.state.registeredElements,
      elements: this._elements,
    };
  }

  props: Props;
  context: ProviderContext;
  _elements: ElementsShape | null = null;

  handleRegisterElement = (
    element: Object,
    impliedTokenType: ?string,
    impliedSourceType: ?string,
    impliedPaymentMethodType: ?string
  ) => {
    this.setState((prevState) => ({
      registeredElements: [
        ...prevState.registeredElements,
        {
          element,
          ...(impliedTokenType ? {impliedTokenType} : {}),
          ...(impliedSourceType ? {impliedSourceType} : {}),
          ...(impliedPaymentMethodType ? {impliedPaymentMethodType} : {}),
        },
      ],
    }));
  };

  handleUnregisterElement = (el: Object) => {
    this.setState((prevState) => ({
      registeredElements: prevState.registeredElements.filter(
        ({element}) => element !== el
      ),
    }));
  };

  render() {
    return React.Children.only(this.props.children);
  }
}
