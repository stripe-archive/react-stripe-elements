// @flow
import React from 'react';
import PropTypes from 'prop-types';

import type {FormContext} from './Elements';
import type {StripeContext} from './Provider';

type Context = FormContext & StripeContext;

export type StripeProps = {
  createToken: Function,
  createSource: Function,
}

// react-redux does a bunch of stuff with pure components / checking if it needs to re-render.
// not sure if we need to do the same.
const inject = <P: Object>(WrappedComponent: ReactClass<P & StripeProps>): ReactClass<P> => class extends React.Component {
  static contextTypes = {
    stripe: PropTypes.object.isRequired,
    registeredElements: PropTypes.arrayOf(PropTypes.shape({
      element: PropTypes.object.isRequired,
      type: PropTypes.string.isRequired,
    })),
  }
  static displayName = `InjectStripe(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  constructor(props: P, context: Context) {
    if (!context || !context.registeredElements) {
      throw new Error(
        `It looks like you are trying to inject Stripe context outside of an Elements context.
Please be sure the component that calls createSource or createToken is within an <Elements> component.`
      );
    }

    super(props, context);
  }

  context: Context

  stripeProps(): StripeProps {
    return {
      ...this.context.stripe,
      // These are the only functions that take elements.
      createToken: this.wrappedCreateToken,
      createSource: this.wrappedCreateSource,
    };
  }
  findElement = (specifiedType: mixed) => {
    // Find the correct one!
    // TODO: does this mean we need to do something elements-side to possibly make this sort of thing easier?
    // e.g. if a type is specified in source creation, passing any element from the element group could suffice.
    const allElements = this.context.registeredElements || [];
    const matchingElements = specifiedType && typeof specifiedType === 'string' ?
      allElements.filter(({type}) => type === specifiedType) :
      allElements;

    if (matchingElements.length === 1) {
      return matchingElements[0].element;
    } else {
      throw new Error(
        `You did not specify the type of Source or Token to create.
        We could not infer which Element you want to use for this operation.`
      );
    }
  }
  wrappedCreateToken = (options: mixed = {}) => {
    if (options && typeof options === 'object') {
      const {type, ...rest} = options;
      const element = this.findElement(type);
      return this.context.stripe.createToken(element, rest);
    } else {
      throw new Error(`Invalid options passed to createToken. Expected an object, got ${options === null ? 'null' : typeof options}.`);
    }
  }
  wrappedCreateSource = (options: mixed) => {
    if (options && typeof options === 'object') {
      const {type, ...rest} = options; // eslint-disable-line no-unused-vars
      const element = this.findElement(type);
      return this.context.stripe.createSource(element, rest);
    } else {
      throw new Error(`Invalid options passed to createToken. Expected an object, got ${typeof options}.`);
    }
  }
  render() {
    return <WrappedComponent {...this.props} stripe={this.stripeProps()} />;
  }
};

export default inject;
