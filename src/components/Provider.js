// @flow
import React from 'react';
import PropTypes from 'prop-types';

type StripeFactoryProps = {
  apiKey: string,
};

export type StripeFactory = (props: StripeFactoryProps) => StripeShape;

type Props = StripeFactoryProps & {
  stripeFactory: StripeFactory,
  children?: any,
};

export type StripeContext = {
  stripe: StripeShape,
};

const defaultStripeFactory = (props: StripeFactoryProps): StripeShape => {
  if (!window.Stripe) {
    throw new Error(
      'Please load Stripe.js (https://js.stripe.com/v3/) on this page to use react-stripe-elements.'
    );
  }

  const {apiKey, ...options} = props;

  return window.Stripe(apiKey, options);
};

export default class Provider extends React.Component<Props> {
  // Even though we're using flow, also use PropTypes so we can take advantage of developer warnings.
  static propTypes = {
    apiKey: PropTypes.string.isRequired,
    children: PropTypes.node,
    stripeFactory: PropTypes.func.isRequired,
  };
  static childContextTypes = {
    stripe: PropTypes.object.isRequired,
  };
  static defaultProps = {
    children: null,
    stripeFactory: defaultStripeFactory,
  };

  constructor(props: Props) {
    super(props);

    const {stripeFactory, children, ...factoryProps} = this.props;

    this._stripe = stripeFactory(factoryProps);
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
      console.error(
        'StripeProvider does not support changing the apiKey parameter.'
      ); // eslint-disable-line no-console
    }
  }
  props: Props;
  _stripe: StripeShape;
  _didWarn: boolean;

  render() {
    return React.Children.only(this.props.children);
  }
}
