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

    // Finds an Element by the specified type, if one exists.
    // Throws if multiple Elements match.
    findElement = (
      filterBy: 'impliedTokenType' | 'impliedSourceType',
      specifiedType: string
    ): ?ElementShape => {
      const allElements = this.context.getRegisteredElements();
      const filteredElements = allElements.filter((e) => e[filterBy]);
      const matchingElements =
        specifiedType === 'auto'
          ? filteredElements
          : filteredElements.filter((e) => e[filterBy] === specifiedType);

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

    // Require that exactly one Element is found for the specified type.
    // Throws if no Element is found.
    requireElement = (
      filterBy: 'impliedTokenType' | 'impliedSourceType',
      specifiedType: string
    ): ElementShape => {
      const element = this.findElement(filterBy, specifiedType);
      if (element) {
        return element;
      } else {
        throw new Error(
          `You did not specify the type of Source or Token to create.
        We could not infer which Element you want to use for this operation.`
        );
      }
    };

    // Wraps createToken in order to infer the Element that is being tokenized.
    wrappedCreateToken = (stripe: StripeShape) => (
      tokenTypeOrOptions: mixed = {},
      options: mixed = {}
    ) => {
      if (tokenTypeOrOptions && typeof tokenTypeOrOptions === 'object') {
        // First argument is options; infer the Element and tokenize
        const opts = tokenTypeOrOptions;
        const {type: tokenType, ...rest} = opts;
        const specifiedType =
          typeof tokenType === 'string' ? tokenType : 'auto';
        // Since only options were passed in, a corresponding Element must exist
        // for the tokenization to succeed -- thus we call requireElement.
        const element = this.requireElement('impliedTokenType', specifiedType);
        return stripe.createToken(element, rest);
      } else if (typeof tokenTypeOrOptions === 'string') {
        // First argument is token type; tokenize with token type and options
        const tokenType = tokenTypeOrOptions;
        return stripe.createToken(tokenType, options);
      } else {
        // If a bad value was passed in for options, throw an error.
        throw new Error(
          `Invalid options passed to createToken. Expected an object, got ${typeof tokenTypeOrOptions}.`
        );
      }
    };

    // Wraps createSource in order to infer the Element that is being used for
    // source creation.
    wrappedCreateSource = (stripe: StripeShape) => (options: mixed = {}) => {
      if (options && typeof options === 'object') {
        if (typeof options.type !== 'string') {
          throw new Error(
            `Invalid Source type passed to createSource. Expected string, got ${typeof options.type}.`
          );
        }

        const element = this.findElement('impliedSourceType', options.type);
        if (element) {
          // If an Element exists for the source type, use that to create the
          // corresponding source.
          //
          // NOTE: this prevents users from independently creating sources of
          // type `foo` if an Element that can create `foo` sources exists in
          // the current <Elements /> context.
          return stripe.createSource(element, options);
        } else {
          // If no Element exists for the source type, directly create a source.
          return stripe.createSource(options);
        }
      } else {
        // If a bad value was passed in for options, throw an error.
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
