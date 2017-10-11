// @noflow
import React from 'react';
import {mount, shallow} from 'enzyme';

import StripeProvider from './Provider';

describe('StripeProvider', () => {
  let stripeMockFn;
  let stripeMockResult;

  beforeEach(() => {
    stripeMockResult = {
      elements: jest.fn(),
      createToken: jest.fn(),
      createSource: jest.fn(),
    };
    stripeMockFn = jest.fn().mockReturnValue(stripeMockResult);
    window.Stripe = stripeMockFn;
  });

  it('requires apiKey', () => {
    const originalConsoleError = global.console.error;
    const mockConsoleError = jest.fn();
    global.console.error = mockConsoleError;
    shallow(
      <StripeProvider>
        <div />
      </StripeProvider>
    );
    expect(mockConsoleError.mock.calls[0][0]).toContain(
      'Warning: Failed prop type: The prop `apiKey` is marked as required in `Provider`, but its value is `undefined`.'
    );
    global.console.error = originalConsoleError;
  });

  it('throws without stripe.js loaded', () => {
    window.Stripe = null;
    expect(() => shallow(<StripeProvider apiKey="made_up_key" />)).toThrow(
      'Please load Stripe.js (https://js.stripe.com/v3/) on this page to use react-stripe-elements.'
    );
  });

  it('throws without children', () => {
    expect(() => shallow(<StripeProvider apiKey="made_up_key" />)).toThrow(
      'React.Children.only expected to receive a single React element child'
    );
  });

  it('throws with more than one children', () => {
    expect(() =>
      shallow(
        <StripeProvider apiKey="made_up_key">
          <div />
          <div />
        </StripeProvider>
      )
    ).toThrow(
      'React.Children.only expected to receive a single React element child'
    );
  });

  it('renders its single child', () => {
    const wrapper = shallow(
      <StripeProvider apiKey="made_up_key">
        <form>
          <input />
        </form>
      </StripeProvider>
    );

    expect(wrapper.html()).toBe('<form><input/></form>');
  });

  it('initializes Stripe with apiKey and empty options', () => {
    shallow(
      <StripeProvider apiKey="made_up_key">
        <form />
      </StripeProvider>
    );
    expect(stripeMockFn).toHaveBeenCalledWith('made_up_key', {});
  });

  it('initializes Stripe with apiKey and arbitrary props as options', () => {
    shallow(
      <StripeProvider apiKey="made_up_key" foo="bar">
        <form />
      </StripeProvider>
    );
    expect(stripeMockFn).toHaveBeenCalledWith('made_up_key', {foo: 'bar'});
  });

  it('provides context.stripe', () => {
    const wrapper = mount(
      <StripeProvider apiKey="made_up_key">
        <form />
      </StripeProvider>
    );
    const childContext = wrapper.node.getChildContext();
    expect(childContext).toEqual({stripe: stripeMockResult});
  });

  it('does not create a new Stripe instance if one exists for the same key', () => {
    window.Stripe = jest.fn(() => ({}));

    // First, create the first instance.
    let wrapper = mount(
      <StripeProvider apiKey="key_one">
        <form />
      </StripeProvider>
    );
    let childContext = wrapper.node.getChildContext();
    const keyOneInstance = childContext.stripe;
    expect(keyOneInstance).toBeTruthy();

    // Create another!
    wrapper = mount(
      <StripeProvider apiKey="key_one">
        <form />
      </StripeProvider>
    );
    childContext = wrapper.node.getChildContext();
    expect(childContext.stripe).toBe(keyOneInstance);

    // Create another, but with a different key!
    wrapper = mount(
      <StripeProvider apiKey="key_two">
        <form />
      </StripeProvider>
    );
    childContext = wrapper.node.getChildContext();
    expect(childContext.stripe).not.toBe(keyOneInstance);
  });

  it('warns when trying to change the API key', () => {
    const originalConsoleError = global.console.error;
    const mockConsoleError = jest.fn();
    global.console.error = mockConsoleError;
    const wrapper = shallow(
      <StripeProvider apiKey="made_up_key">
        <form />
      </StripeProvider>
    );
    wrapper.setProps({apiKey: 'a_new_key'});
    expect(mockConsoleError).toHaveBeenCalledWith(
      'StripeProvider does not support changing the apiKey parameter.'
    );
    global.console.error = originalConsoleError;
  });
});
