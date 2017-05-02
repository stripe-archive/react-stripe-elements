// @flow
import StripeProvider from './components/Provider';
import injectStripe from './components/inject';
import Elements from './components/Elements';
import Element from './components/Element';

const CardElement = Element('card', {sourceType: 'card'});
const CardNumberElement = Element('cardNumber', {sourceType: 'card'});
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
};
