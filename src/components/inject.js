// @flow
import React, {type ComponentType} from 'react';

import {
  type SyncStripeContext,
  type AsyncStripeContext,
  providerContextTypes,
} from './Provider';

type Context = SyncStripeContext | AsyncStripeContext;

type Options = {
  withRef?: boolean,
};

type State = {stripe: StripeShape | null};
export type InjectedProps = {stripe: StripeShape};
// convenience type for demos when we are using sync loading
export type AsyncInjectedProps = {stripe: StripeShape | null};

// react-redux does a bunch of stuff with pure components / checking if it needs to re-render.
// not sure if we need to do the same.
const inject = <Props: {}>(
  WrappedComponent: ComponentType<AsyncInjectedProps & Props>,
  componentOptions: Options = {}
): ComponentType<Props> => {
  const {withRef = false} = componentOptions;

  return class extends React.Component<Props, State> {
    static contextTypes = {
      ...providerContextTypes,
    };
    static displayName = `InjectStripe(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'})`;

    constructor(props: Props, context: Context) {
      if (!context || !context.tag === 'async' || !context.tag === 'sync') {
        throw new Error(
          `It looks like you are trying to inject Stripe context outside of an stripe <Proivider> context.`
        );
      }

      super(props, context);

      if (this.context.tag === 'sync') {
        this.state = {
          stripe: this.context.stripe,
        };
      } else {
        this.state = {
          stripe: null,
        };
      }
    }

    componentDidMount() {
      if (this.context.tag === 'async') {
        this.context.addStripeLoadListener((stripe: StripeShape) => {
          this.setState({stripe});
        });
      } else {
        // when 'sync', it's already set in the constructor.
      }
    }

    getWrappedInstance() {
      if (!withRef) {
        throw new Error(
          'To access the wrapped instance, the `{withRef: true}` option must be set when calling `injectStripe()`'
        );
      }
      return this.wrappedInstance;
    }

    context: Context;
    wrappedInstance: ?React.Component<InjectedProps & Props, any>;

    render() {
      return (
        <WrappedComponent
          {...this.props}
          stripe={this.state.stripe}
          ref={
            withRef
              ? (c) => {
                  this.wrappedInstance = c;
                }
              : null
          }
        />
      );
    }
  };
};

export default inject;
