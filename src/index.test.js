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

  const WrappedCheckout = (type, additionalOptions) => {
    const MyCheckout = props => {
      return (
        <form
          onSubmit={ev => {
            ev.preventDefault();
            if (type === 'token') {
              props.stripe.createToken(additionalOptions);
            } else {
              props.stripe.createSource(additionalOptions);
            }
          }}
        >
          {props.children}
          <button>Pay</button>
        </form>
      );
    };
    return injectStripe(MyCheckout);
  };

  it('smoke test', () => {
    const Checkout = WrappedCheckout('token');
    const app = mount(
      <StripeProvider apiKey="pk_test_xxx">
        <Elements>
          <Checkout>
            Hello world
            <CardElement />
          </Checkout>
        </Elements>
      </StripeProvider>
    );
    expect(app.text()).toMatch(/Hello world/);
  });

  describe('createToken', () => {
    it('should be called when set up properly', () => {
      const Checkout = WrappedCheckout('token');
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <Checkout>
              Hello world
              <CardElement />
            </Checkout>
          </Elements>
        </StripeProvider>
      );
      app.find('form').simulate('submit');
      expect(stripeMock.createToken).toHaveBeenCalledTimes(1);
      expect(stripeMock.createToken).toHaveBeenCalledWith(elementMock, {});
    });

    it('should be called when set up properly (split)', () => {
      const Checkout = WrappedCheckout('token');
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <Checkout>
              Hello world
              <CardNumberElement />
              <CardExpiryElement />
              <CardCVCElement />
              <PostalCodeElement />
            </Checkout>
          </Elements>
        </StripeProvider>
      );
      app.find('form').simulate('submit');
      expect(stripeMock.createToken).toHaveBeenCalledTimes(1);
      expect(stripeMock.createToken).toHaveBeenCalledWith(elementMock, {});
    });

    it('should be callable for other token types', () => {
      const Checkout = injectStripe(props =>
        <form
          onSubmit={ev => {
            ev.preventDefault();
            props.stripe.createToken('bank_account', {some: 'data'});
          }}
        >
          {props.children}
          <button>Pay</button>
        </form>
      );
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <Checkout>Hello world</Checkout>
          </Elements>
        </StripeProvider>
      );
      app.find('form').simulate('submit');
      expect(stripeMock.createToken).toHaveBeenCalledTimes(1);
      expect(stripeMock.createToken).toHaveBeenCalledWith('bank_account', {
        some: 'data',
      });
    });
  });

  describe('createSource', () => {
    it('should be called when set up properly', () => {
      const Checkout = WrappedCheckout('source');
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <Checkout>
              Hello world
              <CardElement />
            </Checkout>
          </Elements>
        </StripeProvider>
      );
      app.find('form').simulate('submit');
      expect(stripeMock.createSource).toHaveBeenCalledTimes(1);
      expect(stripeMock.createSource).toHaveBeenCalledWith(elementMock, {});
    });

    it('should take additional parameters', () => {
      const Checkout = WrappedCheckout('source', {owner: {name: 'Michelle'}});
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <Checkout>
              Hello world
              <CardElement />
            </Checkout>
          </Elements>
        </StripeProvider>
      );
      app.find('form').simulate('submit');
      expect(stripeMock.createSource).toHaveBeenCalledTimes(1);
      expect(stripeMock.createSource).toHaveBeenCalledWith(elementMock, {
        owner: {name: 'Michelle'},
      });
    });

    it('should be callable for other source types', () => {
      const Checkout = injectStripe(props =>
        <form
          onSubmit={ev => {
            ev.preventDefault();
            props.stripe.createSource({
              type: 'three_d_secure',
              three_d_secure: {foo: 'bar'},
            });
          }}
        >
          {props.children}
          <button>Pay</button>
        </form>
      );
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <Checkout>Hello world</Checkout>
          </Elements>
        </StripeProvider>
      );
      app.find('form').simulate('submit');
      expect(stripeMock.createSource).toHaveBeenCalledTimes(1);
      expect(stripeMock.createSource).toHaveBeenCalledWith({
        type: 'three_d_secure',
        three_d_secure: {foo: 'bar'},
      });
    });
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
      expect(() => mount(<StripeProvider apiKey="pk_test_xxx" />)).toThrowError(
        /js.stripe.com\/v3/
      );
    });

    describe('createSource', () => {
      it('should throw when no Element found', () => {
        const Checkout = WrappedCheckout('source');
        const app = mount(
          <StripeProvider apiKey="pk_test_xxx">
            <Elements>
              <Checkout>Hello world</Checkout>
            </Elements>
          </StripeProvider>
        );
        expect(() => app.find('form').simulate('submit')).toThrowError(
          /did not specify/
        );
      });
    });

    describe('createToken', () => {
      it('should throw when not in Elements', () => {
        const Checkout = WrappedCheckout('token');
        expect(() =>
          mount(
            <StripeProvider apiKey="pk_test_xxx">
              <Checkout>
                <Elements>
                  <CardElement />
                </Elements>
              </Checkout>
            </StripeProvider>
          )
        ).toThrowError('Elements context');
      });

      it('should throw when no Element found', () => {
        const Checkout = WrappedCheckout('token');
        const app = mount(
          <StripeProvider apiKey="pk_test_xxx">
            <Elements>
              <Checkout>Hello world</Checkout>
            </Elements>
          </StripeProvider>
        );
        expect(() => app.find('form').simulate('submit')).toThrowError(
          /did not specify/
        );
      });
    });
  });
});
