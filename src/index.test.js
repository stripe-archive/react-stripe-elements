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

class PureWrapper extends React.PureComponent {
  render() {
    return <div>{this.props.children}</div>;
  }
}

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
    const MyCheckout = (props) => {
      return (
        <form
          onSubmit={(ev) => {
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

  it("shouldn't choke on pure components", () => {
    const Checkout = WrappedCheckout('token');
    const app = mount(
      <StripeProvider apiKey="pk_test_xxx">
        <Elements>
          <PureWrapper>
            <Checkout>
              <CardElement />
            </Checkout>
          </PureWrapper>
        </Elements>
      </StripeProvider>
    );
    expect(() => app.find('form').simulate('submit')).not.toThrow();
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
      const Checkout = injectStripe((props) => (
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            props.stripe.createToken('bank_account', {some: 'data'});
          }}
        >
          {props.children}
          <button>Pay</button>
        </form>
      ));
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
      const Checkout = WrappedCheckout('source', {type: 'card'});
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
        type: 'card',
      });
    });

    it('should take additional parameters', () => {
      const Checkout = WrappedCheckout('source', {
        type: 'card',
        owner: {name: 'Michelle'},
      });
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
        type: 'card',
        owner: {name: 'Michelle'},
      });
    });

    it('should be callable when no Element is found', () => {
      const Checkout = WrappedCheckout('source', {
        type: 'card',
        token: 'tok_xxx',
      });
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
        type: 'card',
        token: 'tok_xxx',
      });
    });

    it('should be callable for other source types', () => {
      const Checkout = injectStripe((props) => (
        <form
          onSubmit={(ev) => {
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
      ));
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

  describe('errors', () => {
    describe('createSource', () => {
      it('should throw if no source type is specified', () => {
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
        expect(() => app.find('form').simulate('submit')).toThrowError(
          /Invalid Source type/
        );
      });
    });

    describe('createToken', () => {
      it('should throw when not in Elements', () => {
        // Prevent the expected console.error from react to keep the test output clean
        const originalConsoleError = global.console.error;
        global.console.error = (msg) => {
          if (
            !msg.startsWith(
              'Warning: Failed context type: The context `getRegisteredElements` is marked as required'
            )
          ) {
            originalConsoleError(msg);
          }
        };

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

        global.console.error = originalConsoleError;
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
