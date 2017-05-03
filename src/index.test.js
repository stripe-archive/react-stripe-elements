// @noflow
import React from 'react';
import {mount} from 'enzyme';

import {
  StripeProvider,
  Elements,
  injectStripe,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
} from './index';

describe('index', () => {
  let elementMock;
  let elementsMock;
  let stripeMock;
  beforeEach(() => {
    elementMock = {
      mount: jest.fn(),
      destroy: jest.fn(),
      on: jest.fn(),
      update: jest.fn(),
    };
    elementsMock = {
      create: jest.fn().mockReturnValue(elementMock),
    };
    stripeMock = {
      elements: jest.fn().mockReturnValue(elementsMock),
      createToken: jest.fn(),
      createSource: jest.fn(),
    };

    window.Stripe = jest.fn().mockReturnValue(stripeMock);
  });

  const MyCheckout = (props) => {
    return (
      <form
        onSubmit={(ev) => {
          ev.preventDefault();
          props.stripe.createToken();
        }}
      >
        {props.children}
        <button>Pay</button>
      </form>
    );
  };

  const WrappedCheckout = injectStripe(MyCheckout);

  it('smoke test', () => {
    const app = mount(
      <StripeProvider apiKey="pk_test_xxx">
        <Elements>
          <WrappedCheckout>
            Hello world
            <CardElement />
          </WrappedCheckout>
        </Elements>
      </StripeProvider>
    );
    expect(app.text()).toMatch(/Hello world/);
  });

  it('createToken should be called when set up properly', () => {
    const app = mount(
      <StripeProvider apiKey="pk_test_xxx">
        <Elements>
          <WrappedCheckout>
            Hello world
            <CardElement />
          </WrappedCheckout>
        </Elements>
      </StripeProvider>
    );
    app.find('form').simulate('submit');
    expect(stripeMock.createToken).toHaveBeenCalledTimes(1);
    expect(stripeMock.createToken).toHaveBeenCalledWith(elementMock, {});
  });

  it('createToken should be called when set up properly (split)', () => {
    const app = mount(
      <StripeProvider apiKey="pk_test_xxx">
        <Elements>
          <WrappedCheckout>
            Hello world
            <CardNumberElement />
            <CardExpiryElement />
            <CardCVCElement />
            <PostalCodeElement />
          </WrappedCheckout>
        </Elements>
      </StripeProvider>
    );
    app.find('form').simulate('submit');
    expect(stripeMock.createToken).toHaveBeenCalledTimes(1);
    expect(stripeMock.createToken).toHaveBeenCalledWith(elementMock, {});
  });

  describe('updating props', () => {
    it('should warn when attempting to update API key', () => {
      const stripe = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <form />
        </StripeProvider>
      );
      console.error = jest.fn();
      stripe.setProps({apiKey: 'pk_test_yyy'});
      expect(console.error).toHaveBeenCalledTimes(1);
    });
  });

  describe('errors', () => {
    it('Provider should throw if Stripe is not loaded', () => {
      window.Stripe = undefined;
      expect(() => mount(<StripeProvider apiKey="pk_test_xxx" />)).toThrowError(/js.stripe.com\/v3/);
    });

    it('createToken should throw when not in Elements', () => {
      expect(() => mount(
        <StripeProvider apiKey="pk_test_xxx">
          <WrappedCheckout>
            <Elements>
              <CardElement />
            </Elements>
          </WrappedCheckout>
        </StripeProvider>
      )).toThrowError('Elements context');
    });

    it('createToken should throw when no Element found', () => {
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <WrappedCheckout>
              Hello world
            </WrappedCheckout>
          </Elements>
        </StripeProvider>
      );
      expect(() => app.find('form').simulate('submit')).toThrowError(/did not specify/);
    });
  });
});
