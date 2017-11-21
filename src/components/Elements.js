// @flow
import React from 'react';
import PropTypes from 'prop-types';
import type {StripeContext} from './Provider';

type ElementsList = Array<{type: string, element: ElementShape}>;

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
  elements: ElementsShape,
  registerElement: (type: string, element: ElementShape) => void,
  unregisterElement: (element: ElementShape) => void,
};

type Context = InjectContext & ElementContext;

export default class Elements extends React.Component<Props, State> {
  static childContextTypes = {
    elements: PropTypes.object.isRequired,
    registerElement: PropTypes.func.isRequired,
    unregisterElement: PropTypes.func.isRequired,
    getRegisteredElements: PropTypes.func.isRequired,
  };
  static contextTypes = {
    stripe: PropTypes.object.isRequired,
  };
  static defaultProps = {
    children: null,
  };
  constructor(props: Props, context: StripeContext) {
    super(props, context);

    const {children, ...options} = this.props;
    this._elements = this.context.stripe.elements(options);

    this.state = {
      registeredElements: [],
    };
  }

  getChildContext(): Context {
    return {
      elements: this._elements,
      registerElement: this.handleRegisterElement,
      unregisterElement: this.handleUnregisterElement,
      getRegisteredElements: () => this.state.registeredElements,
    };
  }
  props: Props;
  context: StripeContext;
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
