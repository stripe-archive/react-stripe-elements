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
      createPaymentMethod: jest.fn(),
      handleCardPayment: jest.fn(),
    };
    stripeMockFn = jest.fn().mockReturnValue(stripeMockResult);
    window.Stripe = stripeMockFn;
  });

  it('requires apiKey or stripe prop', () => {
    expect(() => {
      shallow(
        <StripeProvider>
          <div />
        </StripeProvider>
      );
    }).toThrow(/Please pass either 'apiKey' or 'stripe' to StripeProvider./);
  });

  it('throws without stripe.js loaded if using apiKey', () => {
    window.Stripe = null;
    expect(() => shallow(<StripeProvider apiKey="made_up_key" />)).toThrow(
      'Please load Stripe.js (https://js.stripe.com/v3/) on this page to use react-stripe-elements.'
    );
  });

  it('requires not both apiKey and stripe prop', () => {
    expect(() => {
      shallow(
        <StripeProvider apiKey="made_up_key" stripe={stripeMockResult}>
          <div />
        </StripeProvider>
      );
    }).toThrow(
      /Please pass either 'apiKey' or 'stripe' to StripeProvider, not both./
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

  it('provides sync context.stripe if using apiKey', () => {
    const wrapper = mount(
      <StripeProvider apiKey="made_up_key">
        <form />
      </StripeProvider>
    );
    const childContext = wrapper.instance().getChildContext();
    expect(childContext).toEqual({stripe: stripeMockResult, tag: 'sync'});
  });

  it('if stripe prop non-null *at mount*, provides sync context', () => {
    const wrapper = mount(
      <StripeProvider stripe={stripeMockResult}>
        <form />
      </StripeProvider>
    );
    const childContext = wrapper.instance().getChildContext();
    expect(childContext).toEqual({stripe: stripeMockResult, tag: 'sync'});
  });

  it('if stripe prop null *at mount*, provides async context', () => {
    const wrapper = mount(
      <StripeProvider stripe={null}>
        <form />
      </StripeProvider>
    );
    const childContext = wrapper.instance().getChildContext();
    expect(childContext).toHaveProperty('addStripeLoadListener');
    expect(childContext).toHaveProperty('tag', 'async');
  });

  it('addStripeLoadListener is called when stripe goes from null -> non-null', (done) => {
    const wrapper = mount(
      <StripeProvider stripe={null}>
        <form />
      </StripeProvider>
    );

    const childContext = wrapper.instance().getChildContext();
    childContext.addStripeLoadListener((stripe) => {
      expect(stripe).toEqual(stripeMockResult);
      done();
    });

    wrapper.setProps({stripe: stripeMockResult});
  });

  it('does not create a new Stripe instance if one exists for the same key', () => {
    window.Stripe = jest.fn(() => ({}));

    // First, create the first instance.
    let wrapper = mount(
      <StripeProvider apiKey="key_one">
        <form />
      </StripeProvider>
    );
    let childContext = wrapper.instance().getChildContext();
    const keyOneInstance = childContext.stripe;
    expect(keyOneInstance).toBeTruthy();

    // Create another!
    wrapper = mount(
      <StripeProvider apiKey="key_one">
        <form />
      </StripeProvider>
    );
    childContext = wrapper.instance().getChildContext();
    expect(childContext.stripe).toBe(keyOneInstance);

    // Create another, but with a different key!
    wrapper = mount(
      <StripeProvider apiKey="key_two">
        <form />
      </StripeProvider>
    );
    childContext = wrapper.instance().getChildContext();
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
