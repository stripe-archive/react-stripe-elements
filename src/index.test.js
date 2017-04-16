// @noflow
import React from 'react';
import {mount} from 'enzyme';

import {StripeProvider, injectStripe, CardElement} from './index';

describe('index', () => {
  // tests:
  // provider:
  //   should error if no Stripe on window.
  // element:
  //   should error if not used with right context.
  // injection:
  //   should render children
  it('smoke test', () => {
    // TODO: properly mock Stripe.
    window.Stripe = () => ({
      elements: () => ({
        create: () => ({
          mount: jest.fn(),
          destroy: jest.fn(),
          on: jest.fn(),
          update: jest.fn(),
        }),
      }),
    });

    const MyCheckout = (props) => {
      return (
        <form>{props.children}</form>
      );
    };

    const WrappedDiv = injectStripe(MyCheckout);
    const app = mount(
      <StripeProvider apiKey="pk_test_xxx">
        <WrappedDiv>
          Hello world
          <CardElement />
        </WrappedDiv>
      </StripeProvider>
    );
    expect(app.text()).toMatch(/Hello world/);
  });

  describe('errors', () => {
    it('Provider should throw if Stripe is not loaded', () => {
      window.Stripe = undefined;
      expect(() => mount(<StripeProvider apiKey="pk_test_xxx" />)).toThrowError(/js.stripe.com\/v3/);
    });

    it('Element should throw if not used in Provider', () => {
      // TODO: what error to throw if not nested properly?
    });
  });
});
