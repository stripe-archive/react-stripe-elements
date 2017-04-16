// @flow
import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  apiKey: string,
  stripeAccount?: ?string,
  locale?: ?string,
  fonts?: ?Array<Object>,
  children?: any,
};
type State = {
  // TODO
  registeredElements: Array<any>,
};

export default class Provider extends React.Component {
  // Even though we're using flow, also use PropTypes so we can take advantage of developer warnings.
  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    stripeAccount: PropTypes.string,
    // elements() options:
    locale: PropTypes.string,
    fonts: PropTypes.array,
    children: PropTypes.any,
  }
  static childContextTypes = {
    stripe: PropTypes.object.isRequired,
    elements: PropTypes.object.isRequired,
    registerElement: PropTypes.func.isRequired,
    unregisterElement: PropTypes.func.isRequired,
    registeredElements: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.string.isRequired,
      element: PropTypes.object.isRequired,
    })).isRequired,
  }

  constructor(props: Props) {
    super(props);

    // TODO: should this library load Stripe.js dynamically automatically?
    if (!window.Stripe) {
      throw new Error('Please load Stripe.js (https://js.stripe.com/v3/) on this page to use react-stripe-elements.');
    }

    const {apiKey, stripeAccount, locale, fonts} = this.props;

    this._stripe = window.Stripe(apiKey, {stripeAccount});

    const options = {};
    if (locale) {
      options.locale = locale;
    }
    if (fonts) {
      options.fonts = fonts;
    }

    this._elements = this._stripe.elements(options);
    this._didWarn = false;

    this.state = {
      registeredElements: [],
    };
  }
  state: State

  getChildContext() {
    return {
      stripe: this._stripe,
      elements: this._elements,
      registerElement: this.handleRegisterElement,
      unregisterElement: this.handleUnregisterElement,
      registeredElements: this.state.registeredElements,
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    if (this._didWarn || this.props.apiKey === nextProps.apiKey) {
      return;
    } else if (window.console && window.console.error) {
      this._didWarn = true;
      console.error('StripeProvider does not support changing the apiKey parameter.'); // eslint-disable-line no-console
      return;
    } else {
      return;
    }
  }
  props: Props
  // TODO: write decls for these.
  _stripe: Object
  _elements: Object
  _didWarn: boolean


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
