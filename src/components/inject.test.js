// @noflow
import React from 'react';
import {mount, shallow} from 'enzyme';

import injectStripe from './inject';

describe('injectStripe()', () => {
  let WrappedComponent;
  let context;
  let createSource;
  let createToken;
  let elementMock;

  beforeEach(() => {
    createSource = jest.fn();
    createToken = jest.fn();
    elementMock = {
      type: 'card',
      element: {
        on: jest.fn(),
      },
    };
    context = {
      stripe: {
        elements: jest.fn(),
        createSource,
        createToken,
      },
      registeredElements: [elementMock],
    };
    WrappedComponent = () => <div />;
    WrappedComponent.displayName = 'WrappedComponent';
  });

  it('sets the correct displayName', () => {
    expect(injectStripe(WrappedComponent).displayName).toBe(
      'InjectStripe(WrappedComponent)'
    );
  });

  it("includes the original component's displayName", () => {
    WrappedComponent.displayName = 'foo';
    expect(injectStripe(WrappedComponent).displayName).toBe(
      'InjectStripe(foo)'
    );
  });

  it("falls back to the original component's name if no displayName is set", () => {
    WrappedComponent.displayName = undefined;
    expect(injectStripe(WrappedComponent).displayName).toBe(
      `InjectStripe(${WrappedComponent.name})`
    );
  });

  it('throws when StripeProvide is missing from ancestry', () => {
    // Prevent the expected console.error from react to keep the test output clean
    const originalConsoleError = global.console.error;
    global.console.error = msg => {
      if (
        !msg.startsWith(
          'Warning: Failed context type: The context `stripe` is marked as required'
        )
      ) {
        originalConsoleError(msg);
      }
    };

    const Injected = injectStripe(WrappedComponent());

    expect(() => shallow(<Injected />)).toThrow(
      `It looks like you are trying to inject Stripe context outside of an Elements context.
Please be sure the component that calls createSource or createToken is within an <Elements> component.`
    );
    global.console.error = originalConsoleError;
  });

  it('renders <WrappedComponent> with `stripe` prop', () => {
    const Injected = injectStripe(WrappedComponent);

    const wrapper = shallow(<Injected />, {
      context,
    });

    const props = wrapper.props();
    expect(props).toHaveProperty('stripe');
    expect(props).toHaveProperty('stripe.createSource');
    expect(props).toHaveProperty('stripe.createToken');
  });

  it('props.stripe.createToken calls createToken', () => {
    const Injected = injectStripe(WrappedComponent);

    const wrapper = shallow(<Injected />, {
      context,
    });

    const props = wrapper.props();
    props.stripe.createToken('test', {foo: 'bar'});
    expect(createToken).toHaveBeenCalledWith('test', {foo: 'bar'});
  });

  it('props.stripe.createSource calls createSource', () => {
    const Injected = injectStripe(WrappedComponent);

    const wrapper = shallow(<Injected />, {
      context,
    });

    const props = wrapper.props();
    props.stripe.createSource({type: 'card', foo: 'bar'});
    expect(createSource).toHaveBeenCalledWith(elementMock.element, {
      foo: 'bar',
    });
  });

  it('props.stripe.createSource calls createSource', () => {
    const Injected = injectStripe(WrappedComponent);

    const wrapper = shallow(<Injected />, {
      context,
    });

    const props = wrapper.props();
    props.stripe.createSource({type: 'card', foo: 'bar'});
    expect(createSource).toHaveBeenCalledWith(elementMock.element, {
      foo: 'bar',
    });
  });

  it('throws when `getWrappedInstance` is called without `{withRef: true}` option.', () => {
    const Injected = injectStripe(WrappedComponent);

    const wrapper = mount(<Injected />, {
      context,
    });

    expect(() => wrapper.node.getWrappedInstance()).toThrow(
      'To access the wrapped instance, the `{withRef: true}` option must be set when calling `injectStripe()`'
    );
  });

  it('`getWrappedInstance` works whith `{withRef: true}` option.', () => {
    // refs won't work with stateless functional components
    class WrappedClassComponent extends React.Component {
      static displayName = 'WrappedClassComponent';
      foo: 'bar';
      render() {
        return <div>{this.foo}</div>;
      }
    }

    const Injected = injectStripe(WrappedClassComponent, {withRef: true});

    const wrapper = mount(<Injected />, {
      context,
    });

    expect(
      wrapper.node.getWrappedInstance() instanceof WrappedClassComponent
    ).toBe(true);
  });
});
