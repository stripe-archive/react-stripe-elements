// @flow
import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  apiKey: string,
  asyncStripeJs: boolean,
  children?: any,
};

const ASYNC_CHECK_INTERVAL = 250;

export type StripeContext = {
  stripe: StripeShape,
};

export default class Provider extends React.Component {
  // Even though we're using flow, also use PropTypes so we can take advantage of developer warnings.
  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    children: PropTypes.any,
    asyncStripeJs: PropTypes.bool,
  }
  static childContextTypes = {
    stripe: PropTypes.object.isRequired,
  }

  constructor(props: Props) {
    super(props);

    const {apiKey, children, asyncStripeJs, ...options} = this.props;

    if (!window.stripe && asyncStripeJs) {
      this._stripeJsInterval = setInterval(this.checkForStripe.bind(this), ASYNC_CHECK_INTERVAL);
    } else if (!window.Stripe) {
      throw new Error('Please load Stripe.js (https://js.stripe.com/v3/) on this page to use react-stripe-elements.');
    } else {
      this.createStripeInstance();
    }
  }

  componentWillUnmount() {
    if (this._stripeJsInterval) {
      clearInterval(this._stripeJsInterval);
      this._stripeJsInterval = null;
    }
  }

  checkForStripe() {
    if (window.Stripe) {
      this.createStripeInstance();
      this.forceUpdate();
    }
  }

  createStripeInstance() {
    this._stripe = window.Stripe(apiKey, options);
    this._didWarn = false;
    if (this._stripeJsInterval) {
      clearInterval(this._stripeJsInterval);
      this._stripeJsInterval = null;
    }
  }

  getChildContext(): StripeContext {
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
  _stripe: StripeShape
  _didWarn: boolean
  _stripeJsInterval: number

  render() {
    return this._stripe ? React.Children.only(this.props.children) : false;
  }
}
