// @flow
import React from 'react';
import PropTypes from 'prop-types';
import type {ProviderContext} from './Provider';

export type ElementsList = Array<{type: string, element: ElementShape}>;
export type ElementsLoadListener = ElementsShape => void;

type Props = {
  children?: any,
};

type State = {
  registeredElements: ElementsList,
};

export type InjectContext = {
  getRegisteredElements: () => ElementsList,
};

export type ElementContext = {
  addElementsLoadListener: ElementsLoadListener => void,
  registerElement: (type: string, element: ElementShape) => void,
  unregisterElement: (element: ElementShape) => void,
};

type ChildContext = InjectContext & ElementContext;

export default class Elements extends React.Component<Props, State> {
  static childContextTypes = {
    addElementsLoadListener: PropTypes.func.isRequired,
    registerElement: PropTypes.func.isRequired,
    unregisterElement: PropTypes.func.isRequired,
    getRegisteredElements: PropTypes.func.isRequired,
  };
  static contextTypes = {
    stripe: PropTypes.object,
    addStripeLoadListener: PropTypes.func,
    tag: PropTypes.string.isRequired,
  };
  static defaultProps = {
    children: null,
  };
  constructor(props: Props, context: ProviderContext) {
    super(props, context);

    this.state = {
      registeredElements: [],
    };
  }

  getChildContext(): ChildContext {
    return {
      addElementsLoadListener: (fn: ElementsLoadListener) => {
        const {children, ...options} = this.props;
        if (this.context.tag === 'sync') {
          fn(this.context.stripe.elements(options));
        } else {
          this.context.addStripeLoadListener((stripe: StripeShape) => {
            fn(stripe.elements(options));
          });
        }
      },
      registerElement: this.handleRegisterElement,
      unregisterElement: this.handleUnregisterElement,
      getRegisteredElements: () => this.state.registeredElements,
    };
  }
  props: Props;
  context: ProviderContext;
  _elements: ElementsShape;

  handleRegisterElement = (type: string, element: Object) => {
    this.setState(prevState => ({
      registeredElements: [...prevState.registeredElements, {type, element}],
    }));
  };

  handleUnregisterElement = (el: Object) => {
    this.setState(prevState => ({
      registeredElements: prevState.registeredElements.filter(
        ({element}) => element !== el
      ),
    }));
  };

  render() {
    return React.Children.only(this.props.children);
  }
}
