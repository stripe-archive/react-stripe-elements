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

  // Before ALL tests (sync or async)
  beforeEach(() => {
    createSource = jest.fn();
    createToken = jest.fn();
    elementMock = {
      element: {
        on: jest.fn(),
      },
      impliedTokenType: 'card',
      impliedSourceType: 'card',
    };
    WrappedComponent = () => <div />;
    WrappedComponent.displayName = 'WrappedComponent';
  });

  describe('[sync]', () => {
    // Before ONLY sync tests
    beforeEach(() => {
      context = {
        tag: 'sync',
        stripe: {
          elements: jest.fn(),
          createSource,
          createToken,
        },
        getRegisteredElements: () => [elementMock],
      };
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

    it('throws when StripeProvider is missing from ancestry', () => {
      // Prevent the expected console.error from react to keep the test output clean
      const originalConsoleError = global.console.error;
      global.console.error = (msg) => {
        if (
          !msg.startsWith(
            'Warning: Failed context type: The context `tag` is marked as required'
          ) &&
          !msg.startsWith(
            'Warning: Failed context type: The context `getRegisteredElements` is marked as required'
          )
        ) {
          originalConsoleError(msg);
        }
      };

      const Injected = injectStripe(WrappedComponent());

      expect(() => shallow(<Injected />)).toThrow(
        /It looks like you are trying to inject Stripe context outside of an Elements context/
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

    it('props.stripe.createToken calls createToken with element and empty options when called with no arguments', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context,
      });

      const props = wrapper.props();
      props.stripe.createToken();
      expect(createToken).toHaveBeenCalledWith(elementMock.element, {});
    });

    it('props.stripe.createToken calls createToken with element and options when called with options object', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context,
      });

      const props = wrapper.props();
      props.stripe.createToken({foo: 'bar'});
      expect(createToken).toHaveBeenCalledWith(elementMock.element, {
        foo: 'bar',
      });
    });

    it('props.stripe.createToken calls createToken with string as first argument and options object as second', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context,
      });

      const props = wrapper.props();
      props.stripe.createToken('test', {foo: 'bar'});
      expect(createToken).toHaveBeenCalledWith('test', {foo: 'bar'});
    });

    it('props.stripe.createToken throws when called with invalid options type', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context,
      });

      const props = wrapper.props();
      expect(() => props.stripe.createToken(1)).toThrow(
        'Invalid options passed to createToken. Expected an object, got number.'
      );
    });

    it('props.stripe.createToken throws when no element is in the tree', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context: {
          ...context,
          getRegisteredElements: () => [],
        },
      });

      const props = wrapper.props();
      expect(props.stripe.createToken).toThrow(
        /We could not infer which Element you want to use for this operation./
      );
    });

    it('props.stripe.createSource errors when called without a type', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context,
      });

      const props = wrapper.props();
      expect(props.stripe.createSource).toThrow(/Invalid Source type/);
    });

    it('props.stripe.createSource calls createSource with element and type when only type is passed in', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context,
      });

      const props = wrapper.props();
      props.stripe.createSource({type: 'card'});
      expect(createSource).toHaveBeenCalledWith(elementMock.element, {
        type: 'card',
      });
    });

    it('props.stripe.createSource calls createSource with options', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context,
      });

      const props = wrapper.props();
      props.stripe.createSource({type: 'card', foo: 'bar'});
      expect(createSource).toHaveBeenCalledWith(elementMock.element, {
        type: 'card',
        foo: 'bar',
      });
    });

    it('props.stripe.createSource calls createSource with options when called with unknown type', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context,
      });

      const props = wrapper.props();
      props.stripe.createSource({type: 'baz', foo: 'bar'});
      expect(createSource).toHaveBeenCalledWith({type: 'baz', foo: 'bar'});
    });

    it('props.stripe.createSource throws when called with invalid options argument', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context,
      });

      const props = wrapper.props();
      expect(() => props.stripe.createSource(1)).toThrow(
        'Invalid options passed to createSource. Expected an object, got number.'
      );
    });

    it('props.stripe.createSource throws when called with source type that matches multiple elements', () => {
      const Injected = injectStripe(WrappedComponent);

      const wrapper = shallow(<Injected />, {
        context: {
          ...context,
          getRegisteredElements: () => [
            {
              element: {
                on: jest.fn(),
              },
              impliedTokenType: 'card',
              impliedSourceType: 'card',
            },
            {
              element: {
                on: jest.fn(),
              },
              impliedTokenType: 'card',
              impliedSourceType: 'card',
            },
          ],
        },
      });

      const props = wrapper.props();
      expect(() => props.stripe.createSource({type: 'card'})).toThrow(
        /We could not infer which Element you want to use for this operation/
      );
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

  describe('[async]', () => {
    it('props.stripe is null if addStripeLoadListener never fires', () => {
      const Injected = injectStripe(WrappedComponent);
      const wrapper = mount(<Injected />, {
        context: {
          tag: 'async',
          // simulate StripeProvider never giving us a StripeShape
          addStripeLoadListener: () => {},
          getRegisteredElements: () => [elementMock],
        },
      });

      const props = wrapper.find(WrappedComponent).props();
      expect(props).toHaveProperty('stripe', null);
    });

    it('props.stripe is set when addStripeLoadListener fires', () => {
      const Injected = injectStripe(WrappedComponent);
      const wrapper = mount(<Injected />, {
        context: {
          tag: 'async',
          // simulate StripeProvider eventually giving us a StripeShape
          addStripeLoadListener: (fn) => {
            fn({
              elements: jest.fn(),
              createSource,
              createToken,
            });
          },
          getRegisteredElements: () => [elementMock],
        },
      });

      const props = wrapper.find(WrappedComponent).props();
      expect(props).toHaveProperty('stripe');
      expect(props).toHaveProperty('stripe.createToken');
      expect(props).toHaveProperty('stripe.createSource');
    });
  });
});
