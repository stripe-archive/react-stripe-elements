// @flow
import React, {type ComponentType} from 'react';

import {type InjectContext, injectContextTypes} from './Elements';
import {
  type SyncStripeContext,
  type AsyncStripeContext,
  providerContextTypes,
} from './Provider';

type Context =
  | (InjectContext & SyncStripeContext)
  | (InjectContext & AsyncStripeContext);

type Options = {
  withRef?: boolean,
};

type WrappedStripeShape = {
  createToken: Function,
  createSource: Function,
};

type State = {stripe: WrappedStripeShape | null};

export type InjectedProps = {stripe: WrappedStripeShape | null};

// react-redux does a bunch of stuff with pure components / checking if it needs to re-render.
// not sure if we need to do the same.
const inject = <Props: {}>(
  WrappedComponent: ComponentType<InjectedProps & Props>,
  componentOptions: Options = {}
): ComponentType<Props> => {
  const {withRef = false} = componentOptions;

  return class extends React.Component<Props, State> {
    static contextTypes = {
      ...providerContextTypes,
      ...injectContextTypes,
    };
    static displayName = `InjectStripe(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'})`;

    constructor(props: Props, context: Context) {
      if (!context || !context.getRegisteredElements) {
        throw new Error(
          `It looks like you are trying to inject Stripe context outside of an Elements context.
Please be sure the component that calls createSource or createToken is within an <Elements> component.`
        );
      }

      super(props, context);

      if (this.context.tag === 'sync') {
        this.state = {
          stripe: this.stripeProps(this.context.stripe),
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
          this.setState({
            stripe: this.stripeProps(stripe),
          });
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

    stripeProps(stripe: StripeShape): WrappedStripeShape {
      return {
        ...stripe,
        // These are the only functions that take elements.
        createToken: this.wrappedCreateToken(stripe),
        createSource: this.wrappedCreateSource(stripe),
      };
    }
    // Finds the element by the specified type. Throws if multiple Elements match.
    findElement = (specifiedType: string): ?ElementShape => {
      const allElements = this.context.getRegisteredElements();
      const matchingElements =
        specifiedType === 'auto'
          ? allElements
          : allElements.filter(({type}) => type === specifiedType);

      if (matchingElements.length === 1) {
        return matchingElements[0].element;
      } else if (matchingElements.length > 1) {
        throw new Error(
          `You did not specify the type of Source or Token to create.
        We could not infer which Element you want to use for this operation.`
        );
      } else {
        return null;
      }
    };
    // Require that exactly one Element is found.
    requireElement = (specifiedType: string): ElementShape => {
      const element = this.findElement(specifiedType);
      if (element) {
        return element;
      } else {
        throw new Error(
          `You did not specify the type of Source or Token to create.
        We could not infer which Element you want to use for this operation.`
        );
      }
    };

    // createToken has a bit of an unusual method signature for legacy reasons
    // -- we're allowed to pass in the token type OR the element as the first parameter,
    // so we need to check if we're passing in a string as the first parameter and
    // just pass through the options if that's the case.
    wrappedCreateToken = (stripe: StripeShape) => (
      typeOrOptions: mixed = {},
      options: mixed = {}
    ) => {
      if (typeOrOptions && typeof typeOrOptions === 'object') {
        const {type, ...rest} = typeOrOptions;
        const specifiedType = typeof type === 'string' ? type : 'auto';
        const element = this.requireElement(specifiedType);
        return stripe.createToken(element, rest);
      } else if (typeof typeOrOptions === 'string') {
        return stripe.createToken(typeOrOptions, options);
      } else {
        throw new Error(
          `Invalid options passed to createToken. Expected an object, got ${typeof typeOrOptions}.`
        );
      }
    };
    wrappedCreateSource = (stripe: StripeShape) => (options: mixed = {}) => {
      if (options && typeof options === 'object') {
        const {type, ...rest} = options; // eslint-disable-line no-unused-vars
        const specifiedType = typeof type === 'string' ? type : 'auto';

        const element = this.findElement(specifiedType);
        if (element) {
          if (
            specifiedType === 'auto' &&
            window.console &&
            window.console.warn
          ) {
            console.warn(
              "Inferred Source type of 'card' for createSource(). This behavior will be deprecated in a future version. Please pass the Source type to createSource() explicitly."
            );
          }
          return stripe.createSource(element, rest);
        } else if (specifiedType !== 'auto') {
          return stripe.createSource(options);
        } else {
          throw new Error(
            'You did not specify the type of Source to create. We also could not find any Elements in the current context.'
          );
        }
      } else {
        throw new Error(
          `Invalid options passed to createSource. Expected an object, got ${typeof options}.`
        );
      }
    };
    render() {
      return (
        <WrappedComponent
          {...this.props}
          stripe={this.state.stripe}
          ref={
            withRef
              ? c => {
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
