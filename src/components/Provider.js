// @flow
import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  apiKey: string,
  stripeAccount?: ?string,
  children?: any,
};

export default class Provider extends React.Component {
  // Even though we're using flow, also use PropTypes so we can take advantage of developer warnings.
  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    stripeAccount: PropTypes.string,
    children: PropTypes.any,
  }
  static childContextTypes = {
    stripe: PropTypes.object.isRequired,
  }

  constructor(props: Props) {
    super(props);

    // TODO: should this library load Stripe.js dynamically automatically?
    if (!window.Stripe) {
      throw new Error('Please load Stripe.js (https://js.stripe.com/v3/) on this page to use react-stripe-elements.');
    }

    const {apiKey, stripeAccount} = this.props;

    this._stripe = window.Stripe(apiKey, {stripeAccount});
    this._didWarn = false;
  }

  getChildContext() {
    return {
      stripe: this._stripe,
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    if (!this._didWarn && this.props.apiKey !== nextProps.apiKey && window.console && window.console.error) {
      this._didWarn = true;
      console.error('StripeProvider does not support changing the apiKey parameter.'); // eslint-disable-line no-console
    }
  }
  props: Props
  // TODO: write decls for these.
  _stripe: Object
  _didWarn: boolean

  render() {
    return React.Children.only(this.props.children);
  }
}
