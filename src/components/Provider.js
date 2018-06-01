// @flow
import React from 'react';
import PropTypes from 'prop-types';

type Props = {
  apiKey?: string,
  stripe?: mixed,
  children?: any,
};

type Meta =
  | {tag: 'sync', stripe: StripeShape}
  | {tag: 'async', stripe: StripeShape | null};

type StripeLoadListener = (StripeShape) => void;

// TODO(jez) 'sync' and 'async' are bad tag names.
// TODO(jez) What if redux also uses this.context.tag?
export type SyncStripeContext = {
  tag: 'sync',
  stripe: StripeShape,
};
export type AsyncStripeContext = {
  tag: 'async',
  addStripeLoadListener: (StripeLoadListener) => void,
};

export type ProviderContext = SyncStripeContext | AsyncStripeContext;

export const providerContextTypes = {
  tag: PropTypes.string.isRequired,
  stripe: PropTypes.object,
  addStripeLoadListener: PropTypes.func,
};

const getOrCreateStripe = (apiKey: string, options: mixed): StripeShape => {
  /**
   * Note that this is not meant to be a generic memoization solution.
   * This is specifically a solution for `StripeProvider`s being initialized
   * and destroyed regularly (with the same set of props) when users only
   * use `StripeProvider` for the subtree that contains their checkout form.
   */
  window.Stripe.__cachedInstances = window.Stripe.__cachedInstances || {};
  const cacheKey = `key=${apiKey} options=${JSON.stringify(options)}`;

  const stripe =
    window.Stripe.__cachedInstances[cacheKey] || window.Stripe(apiKey, options);
  window.Stripe.__cachedInstances[cacheKey] = stripe;

  return stripe;
};

const ensureStripeShape = (stripe: mixed): StripeShape => {
  if (stripe && stripe.elements && stripe.createSource && stripe.createToken) {
    return ((stripe: any): StripeShape);
  } else {
    throw new Error(
      "Please pass a valid Stripe object to StripeProvider. You can obtain a Stripe object by calling 'Stripe(...)' with your publishable key."
    );
  }
};

export default class Provider extends React.Component<Props> {
  // Even though we're using flow, also use PropTypes so we can take advantage of developer warnings.
  static propTypes = {
    apiKey: PropTypes.string,
    // PropTypes.object is the only way we can accept a Stripe instance
    // eslint-disable-next-line react/forbid-prop-types
    stripe: PropTypes.object,
    children: PropTypes.node,
  };
  // on the other hand: childContextTypes is *required* to use context.
  static childContextTypes = providerContextTypes;
  static defaultProps = {
    apiKey: undefined,
    stripe: undefined,
    children: null,
  };

  constructor(props: Props) {
    super(props);

    if (this.props.apiKey && this.props.stripe) {
      throw new Error(
        "Please pass either 'apiKey' or 'stripe' to StripeProvider, not both."
      );
    } else if (this.props.apiKey) {
      if (!window.Stripe) {
        throw new Error(
          "Please load Stripe.js (https://js.stripe.com/v3/) on this page to use react-stripe-elements. If Stripe.js isn't available yet (it's loading asynchronously, or you're using server-side rendering), see https://github.com/stripe/react-stripe-elements#advanced-integrations"
        );
      } else {
        const {apiKey, children, stripe, ...options} = this.props;
        this._meta = {
          tag: 'sync',
          stripe: getOrCreateStripe(apiKey, options),
        };
      }
    } else if (this.props.stripe) {
      // If we already have a stripe instance (in the constructor), we can behave synchronously.
      this._meta = {
        tag: 'sync',
        stripe: ensureStripeShape(this.props.stripe),
      };
    } else if (this.props.stripe === null) {
      this._meta = {
        tag: 'async',
        stripe: null,
      };
    } else {
      throw new Error(
        "Please pass either 'apiKey' or 'stripe' to StripeProvider. If you're using 'stripe' but don't have a Stripe instance yet, pass 'null' explicitly."
      );
    }

    this._didWarn = false;
    this._didWakeUpListeners = false;
    this._listeners = [];
  }

  getChildContext(): ProviderContext {
    // getChildContext is run after the constructor, so we WILL have access to
    // the initial state.
    //
    // However, context doesn't update in respnse to state changes like you
    // might expect: context is pulled by the child, not pushed by the parent.
    if (this._meta.tag === 'sync') {
      return {
        tag: 'sync',
        stripe: this._meta.stripe,
      };
    } else {
      return {
        tag: 'async',
        addStripeLoadListener: (fn: StripeLoadListener) => {
          if (this._meta.stripe) {
            fn(this._meta.stripe);
          } else {
            this._listeners.push(fn);
          }
        },
      };
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    const apiKeyChanged =
      this.props.apiKey &&
      nextProps.apiKey &&
      this.props.apiKey !== nextProps.apiKey;

    const stripeInstanceChanged =
      this.props.stripe &&
      nextProps.stripe &&
      this.props.stripe !== nextProps.stripe;
    if (
      !this._didWarn &&
      (apiKeyChanged || stripeInstanceChanged) &&
      window.console &&
      window.console.error
    ) {
      this._didWarn = true;
      // eslint-disable-next-line no-console
      console.error(
        'StripeProvider does not support changing the apiKey parameter.'
      );
      return;
    }

    if (!this._didWakeUpListeners && nextProps.stripe) {
      // Wake up the listeners if we've finally been given a StripeShape
      this._didWakeUpListeners = true;
      const stripe = ensureStripeShape(nextProps.stripe);
      this._meta.stripe = stripe;
      this._listeners.forEach((fn) => {
        fn(stripe);
      });
    }
  }

  props: Props;
  _didWarn: boolean;
  _didWakeUpListeners: boolean;
  _listeners: Array<StripeLoadListener>;
  _meta: Meta;

  render() {
    return React.Children.only(this.props.children);
  }
}
