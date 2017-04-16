// @flow
import StripeProvider from './components/Provider';
import injectStripe from './components/inject';
import Element from './components/Element';

const CardElement = Element('card');
const CardNumberElement = Element('cardNumber');
const CardExpiryElement = Element('cardExpiry');
const CardCVCElement = Element('cardCvc');
const PostalCodeElement = Element('postalCode');
export {
  StripeProvider,
  injectStripe,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCVCElement,
  PostalCodeElement,
};
