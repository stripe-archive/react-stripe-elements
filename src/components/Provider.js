// @flow
import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  apiKey: string,
  children?: any,
};

export type StripeContext = {
  stripe: StripeShape,
};

export default class Provider extends React.Component<Props> {
  // Even though we're using flow, also use PropTypes so we can take advantage of developer warnings.
  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    children: PropTypes.node,
  };
  static childContextTypes = {
    stripe: PropTypes.object.isRequired,
  };
  static defaultProps = {
    children: null,
  };

  constructor(props: Props) {
    super(props);

    if (!window.Stripe) {
      throw new Error(
        'Please load Stripe.js (https://js.stripe.com/v3/) on this page to use react-stripe-elements.'
      );
    }

    const {apiKey, children, ...options} = this.props;

    /**
     * Note that this is not meant to be a generic memoization solution.
     * This is specifically a solution for `StripeProvider`s being initialized
     * and destroyed regularly (with the same set of props) when users only
     * use `StripeProvider` for the subtree that contains their checkout form.
     */
    window.Stripe.__cachedInstances = window.Stripe.__cachedInstances || {};
    const cacheKey = `key=${apiKey} options=${JSON.stringify(options)}`;
    this._stripe =
      window.Stripe.__cachedInstances[cacheKey] ||
      window.Stripe(apiKey, options);
    window.Stripe.__cachedInstances[cacheKey] = this._stripe;

    this._didWarn = false;
  }

  getChildContext(): StripeContext {
    return {
      stripe: this._stripe,
    };
  }
  componentWillReceiveProps(nextProps: Props) {
    if (
      !this._didWarn &&
      this.props.apiKey !== nextProps.apiKey &&
      window.console &&
      window.console.error
    ) {
      this._didWarn = true;
      // eslint-disable-next-line no-console
      console.error(
        'StripeProvider does not support changing the apiKey parameter.'
      );
    }
  }
  props: Props;
  _stripe: StripeShape;
  _didWarn: boolean;

  render() {
    return React.Children.only(this.props.children);
  }
}
