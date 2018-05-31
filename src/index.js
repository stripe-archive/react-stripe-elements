// @flow
import StripeProvider from './components/Provider';
import injectStripe from './components/inject';
import Elements from './components/Elements';
import Element from './components/Element';
import PaymentRequestButtonElement from './components/PaymentRequestButtonElement';

// Define Elements, and register their implied token / source types for
// automatic token / source creation.

// Card
const CardElement = Element('card', {
  impliedTokenType: 'card',
  impliedSourceType: 'card',
});

// Split Fields
// Note: we only register the CardNumberElement for split fields so that we have
// a unique Element to infer when calling `wrappedCreateToken` or `wrappedCreateSource`.
const CardNumberElement = Element('cardNumber', {
  impliedTokenType: 'card',
  impliedSourceType: 'card',
});
const CardExpiryElement = Element('cardExpiry');
const CardCVCElement = Element('cardCvc');
const PostalCodeElement = Element('postalCode');

// IBAN
const IbanElement = Element('iban', {
  impliedTokenType: 'bank_account',
  impliedSourceType: 'sepa_debit',
});

// iDEAL Bank
const IdealBankElement = Element('idealBank', {impliedSourceType: 'ideal'});

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
  IbanElement,
  IdealBankElement,
};
