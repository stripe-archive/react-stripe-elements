// @flow
import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  locale?: ?string,
  fonts?: ?Array<Object>,
  children?: any,
};
type State = {
  // TODO
  registeredElements: Array<any>,
};
type Context = {
  stripe: Object,
};

export default class Elements extends React.Component {
  // Even though we're using flow, also use PropTypes so we can take advantage of developer warnings.
  static propTypes = {
    // elements() options:
    locale: PropTypes.string,
    fonts: PropTypes.array,
    children: PropTypes.any,
  }
  static childContextTypes = {
    elements: PropTypes.object.isRequired,
    registerElement: PropTypes.func.isRequired,
    unregisterElement: PropTypes.func.isRequired,
    registeredElements: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string.isRequired,
      element: PropTypes.object.isRequired,
    })).isRequired,
  }
  static contextTypes = {
    stripe: PropTypes.object.isRequired,
  }

  constructor(props: Props, context: Context) {
    super(props, context);

    const {locale, fonts} = this.props;
    const options = {};
    if (locale) {
      options.locale = locale;
    }
    if (fonts) {
      options.fonts = fonts;
    }

    this._elements = this.context.stripe.elements(options);

    this.state = {
      registeredElements: [],
    };
  }
  state: State

  getChildContext() {
    return {
      elements: this._elements,
      registerElement: this.handleRegisterElement,
      unregisterElement: this.handleUnregisterElement,
      registeredElements: this.state.registeredElements,
    };
  }
  props: Props
  context: Context
  _elements: Object

  handleRegisterElement = (type: string, element: Object) => {
    this.setState({
      registeredElements: [...this.state.registeredElements, {type, element}],
    });
  }

  handleUnregisterElement = (el: Object) => {
    this.setState({
      registeredElements: this.state.registeredElements.filter(({type, element}) => element !== el),
    });
  }

  render() {
    return React.Children.only(this.props.children);
  }
}
