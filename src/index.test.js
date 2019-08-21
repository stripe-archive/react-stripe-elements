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
  IbanElement,
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
  let rawElementMock;

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
    rawElementMock = {
      _frame: {
        id: 'id',
      },
      _componentName: 'name',
    };
    stripeMock = {
      elements: jest.fn().mockReturnValue(elementsMock),
      createToken: jest.fn(),
      createSource: jest.fn(),
      createPaymentMethod: jest.fn(),
      handleCardPayment: jest.fn(),
      handleCardSetup: jest.fn(),
    };

    // jest.spyOn(console, 'error');
    // console.error.mockImplementation(() => {});

    window.Stripe = jest.fn().mockReturnValue(stripeMock);
  });

  afterEach(() => {
    // console.error.mockRestore();
  });

  const WrappedCheckout = (onSubmit) => {
    const MyCheckout = (props) => {
      return (
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            onSubmit(props);
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
    const Checkout = WrappedCheckout((props) => props.stripe.createToken());
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
    const Checkout = WrappedCheckout((props) => props.stripe.createToken());
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

    // Prevent the console.errors to keep the test output clean
    jest.spyOn(console, 'error');
    console.error.mockImplementation(() => {});

    expect(() => app.find('form').simulate('submit')).not.toThrow();

    console.error.mockRestore();
  });

  describe('createToken', () => {
    it('should be called when set up properly', () => {
      const Checkout = WrappedCheckout((props) => props.stripe.createToken());
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
      const Checkout = WrappedCheckout((props) => props.stripe.createToken());
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <Checkout>
              Hello world
              <CardNumberElement />
              <CardExpiryElement />
              <CardCVCElement />
            </Checkout>
          </Elements>
        </StripeProvider>
      );
      app.find('form').simulate('submit');
      expect(stripeMock.createToken).toHaveBeenCalledTimes(1);
      expect(stripeMock.createToken).toHaveBeenCalledWith(elementMock, {});
    });

    it('should be callable for other token types', () => {
      const Checkout = WrappedCheckout((props) => {
        props.stripe.createToken('bank_account', {some: 'data'});
      });
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
      const Checkout = WrappedCheckout((props) =>
        props.stripe.createSource({type: 'card'})
      );
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
      const Checkout = WrappedCheckout((props) =>
        props.stripe.createSource({
          type: 'card',
          owner: {name: 'Michelle'},
        })
      );
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
      const Checkout = WrappedCheckout((props) =>
        props.stripe.createSource({
          type: 'card',
          token: 'tok_xxx',
        })
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
        type: 'card',
        token: 'tok_xxx',
      });
    });

    it('should be callable for other source types', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.createSource({
          type: 'three_d_secure',
          three_d_secure: {foo: 'bar'},
        })
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

  describe('createPaymentMethod', () => {
    it('should be called when set up properly', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.createPaymentMethod('card')
      );
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
      expect(stripeMock.createPaymentMethod).toHaveBeenCalledTimes(1);
      expect(stripeMock.createPaymentMethod).toHaveBeenCalledWith(
        'card',
        elementMock
      );
    });

    it('should take additional parameters', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.createPaymentMethod('card', {
          billing_details: {name: 'Michelle'},
        })
      );
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
      expect(stripeMock.createPaymentMethod).toHaveBeenCalledTimes(1);
      expect(stripeMock.createPaymentMethod).toHaveBeenCalledWith(
        'card',
        elementMock,
        {
          billing_details: {name: 'Michelle'},
        }
      );
    });

    it('should be callable when no Element is found', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.createPaymentMethod('card', {
          token: 'tok_xxx',
        })
      );
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <Checkout>Hello world</Checkout>
          </Elements>
        </StripeProvider>
      );
      app.find('form').simulate('submit');
      expect(stripeMock.createPaymentMethod).toHaveBeenCalledTimes(1);
      expect(stripeMock.createPaymentMethod).toHaveBeenCalledWith('card', {
        token: 'tok_xxx',
      });
    });

    it('should be callable when an Element is passed in', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.createPaymentMethod('card', rawElementMock, {
          billing_details: {name: 'David'},
        })
      );
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
      expect(stripeMock.createPaymentMethod).toHaveBeenCalledTimes(1);
      expect(stripeMock.createPaymentMethod).toHaveBeenCalledWith(
        'card',
        rawElementMock,
        {
          billing_details: {name: 'David'},
        }
      );
    });
  });

  describe('handleCardPayment', () => {
    it('should be called when set up properly', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.handleCardPayment('client_secret')
      );
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
      expect(stripeMock.handleCardPayment).toHaveBeenCalledTimes(1);
      expect(stripeMock.handleCardPayment).toHaveBeenCalledWith(
        'client_secret',
        elementMock
      );
    });

    it('should take additional parameters', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.handleCardPayment('client_secret', {
          billing_details: {name: 'Michelle'},
        })
      );
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
      expect(stripeMock.handleCardPayment).toHaveBeenCalledTimes(1);
      expect(stripeMock.handleCardPayment).toHaveBeenCalledWith(
        'client_secret',
        elementMock,
        {
          billing_details: {name: 'Michelle'},
        }
      );
    });

    it('should be callable when no Element is found', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.handleCardPayment('client_secret', {
          payment_method: 'pm_xxx',
        })
      );
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <Checkout>Hello world</Checkout>
          </Elements>
        </StripeProvider>
      );
      app.find('form').simulate('submit');
      expect(stripeMock.handleCardPayment).toHaveBeenCalledTimes(1);
      expect(stripeMock.handleCardPayment).toHaveBeenCalledWith(
        'client_secret',
        {
          payment_method: 'pm_xxx',
        }
      );
    });

    it('should be callable when an Element is passed in', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.handleCardPayment('client_secret', rawElementMock, {
          billing_details: {name: 'David'},
        })
      );
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
      expect(stripeMock.handleCardPayment).toHaveBeenCalledTimes(1);
      expect(stripeMock.handleCardPayment).toHaveBeenCalledWith(
        'client_secret',
        rawElementMock,
        {
          billing_details: {name: 'David'},
        }
      );
    });
  });

  describe('handleCardSetup', () => {
    it('should be called when set up properly', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.handleCardSetup('client_secret')
      );
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
      expect(stripeMock.handleCardSetup).toHaveBeenCalledTimes(1);
      expect(stripeMock.handleCardSetup).toHaveBeenCalledWith(
        'client_secret',
        elementMock
      );
    });

    it('should take additional parameters', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.handleCardSetup('client_secret', {
          billing_details: {name: 'Michelle'},
        })
      );
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
      expect(stripeMock.handleCardSetup).toHaveBeenCalledTimes(1);
      expect(stripeMock.handleCardSetup).toHaveBeenCalledWith(
        'client_secret',
        elementMock,
        {
          billing_details: {name: 'Michelle'},
        }
      );
    });

    it('should be callable when no Element is found', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.handleCardSetup('client_secret', {
          payment_method: 'pm_xxx',
        })
      );
      const app = mount(
        <StripeProvider apiKey="pk_test_xxx">
          <Elements>
            <Checkout>Hello world</Checkout>
          </Elements>
        </StripeProvider>
      );
      app.find('form').simulate('submit');
      expect(stripeMock.handleCardSetup).toHaveBeenCalledTimes(1);
      expect(stripeMock.handleCardSetup).toHaveBeenCalledWith('client_secret', {
        payment_method: 'pm_xxx',
      });
    });

    it('should be callable when an Element is passed in', () => {
      const Checkout = WrappedCheckout((props) =>
        props.stripe.handleCardSetup('client_secret', rawElementMock, {
          billing_details: {name: 'David'},
        })
      );
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
      expect(stripeMock.handleCardSetup).toHaveBeenCalledTimes(1);
      expect(stripeMock.handleCardSetup).toHaveBeenCalledWith(
        'client_secret',
        rawElementMock,
        {
          billing_details: {name: 'David'},
        }
      );
    });
  });

  describe('errors', () => {
    beforeEach(() => {
      // Prevent the console.error to keep the test output clean
      jest.spyOn(console, 'error');
      console.error.mockImplementation(() => {});
    });

    afterEach(() => {
      console.error.mockRestore();
    });

    describe('createSource', () => {
      it('should throw if no source type is specified', () => {
        const Checkout = WrappedCheckout((props) =>
          props.stripe.createSource({})
        );
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

    describe('createPaymentMethod', () => {
      it('should throw if no PaymentMethod type is specified', () => {
        const Checkout = WrappedCheckout((props) =>
          props.stripe.createPaymentMethod()
        );
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
          /Invalid PaymentMethod type/
        );
      });

      it('should throw if no element corresponding to Payment Method type is found', () => {
        const Checkout = WrappedCheckout((props) =>
          props.stripe.createPaymentMethod('card')
        );
        const app = mount(
          <StripeProvider apiKey="pk_test_xxx">
            <Elements>
              <Checkout>
                Hello world
                <IbanElement />
              </Checkout>
            </Elements>
          </StripeProvider>
        );
        expect(() => app.find('form').simulate('submit')).toThrowError(
          /Could not find an Element/
        );
      });
    });

    describe('handleCardPayment', () => {
      it('should throw if no client secret is specified', () => {
        const Checkout = WrappedCheckout((props) =>
          props.stripe.handleCardPayment()
        );
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
          /Invalid PaymentIntent client secret/
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

        const Checkout = WrappedCheckout((props) => props.stripe.createToken());
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
        const Checkout = WrappedCheckout((props) => props.stripe.createToken());
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
