// @flow
import StripeProvider from './components/Provider';
import injectStripe from './components/inject';
import Elements from './components/Elements';
import Element from './components/Element';
import PaymentRequestButtonElement from './components/PaymentRequestButtonElement';

const CardElement = Element('card', {
  impliedTokenType: 'card',
  impliedSourceType: 'card',
});
const CardNumberElement = Element('cardNumber', {
  impliedTokenType: 'card',
  impliedSourceType: 'card',
});
const CardExpiryElement = Element('cardExpiry');
const CardCVCElement = Element('cardCvc');
const PostalCodeElement = Element('postalCode');

export {
  StripeProvider,
  injectStripe,
  Elements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
  PaymentRequestButtonElement,
};
