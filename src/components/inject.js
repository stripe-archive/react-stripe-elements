// @flow
import React from 'react';
import PropTypes from 'prop-types';

// react-redux does a bunch of stuff with pure components / checking if it needs to re-render.
// not sure if we need to do the same.
const inject = (WrappedComponent: ReactClass<any>) => class extends React.Component {
  static contextTypes = {
    stripe: PropTypes.object.isRequired,
    registeredElements: PropTypes.arrayOf(PropTypes.object).isRequired,
  }
  static displayName = `InjectStripe(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  stripeProps() {
    return {
      ...this.context.stripe,
      // These are the only functions that take elements.
      createToken: this.wrappedCreateToken,
      createSource: this.wrappedCreateSource,
    };
  }
  findElement = (specifiedType: mixed): ?Object => {
    // Find the correct one!
    // Accounting for things like cardNumber...
    // TODO: does this mean we need to do something elements-side to possibly make this sort of thing easier?
    // e.g. if a type is specified in source creation, passing any element from the element group could suffice.
    if (specifiedType && typeof specifiedType === 'string') {
      const matchingElements = this.context.registeredElements.filter(({type, element}) => type.indexOf(specifiedType) !== -1);
      const elementInfo = matchingElements[0];
      return elementInfo ? elementInfo.element : undefined;
    } else if (this.context.registeredElements.length === 1) {
      // We can assume, here.
      return this.context.registeredElements[0];
    } else {
      // TODO: should we throw errors here?
      return undefined;
    }
  }
  wrappedCreateToken = (userOptions: mixed) => {
    const options = userOptions || {};

    if (options && typeof options === 'object') {
      const {type: userType, ...rest} = options;
      const elementInfo = this.findElement(userType);
      if (elementInfo) {
        return this.context.stripe.createToken(elementInfo.element, rest);
      } else {
        return this.context.stripe.createToken(userType, rest);
      }
    } else {
      throw new Error(`Invalid options passed to createToken. Expected an object, got ${typeof options}.`);
    }
  }
  wrappedCreateSource = (userOptions: mixed) => {
    const options = userOptions || {};

    if (options && typeof options === 'object') {
      const {type, ...rest} = options; // eslint-disable-line no-unused-vars
      const elementInfo = this.findElement(type);
      if (elementInfo) {
        return this.context.stripe.createSource(elementInfo.element, rest);
      } else {
        return this.context.stripe.createSource(options);
      }
    } else {
      throw new Error(`Invalid options passed to createToken. Expected an object, got ${typeof options}.`);
    }
  }
  render() {
    return <WrappedComponent {...this.props} stripe={this.stripeProps()} />;
  }
};

export default inject;
