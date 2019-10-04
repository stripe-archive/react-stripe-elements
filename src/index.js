// @flow
import StripeProvider from './components/Provider';
import injectStripe from './components/inject';
import Elements from './components/Elements';
import Element from './components/Element';
import PaymentRequestButtonElement from './components/PaymentRequestButtonElement';

const CardElement = Element('card');
const CardNumberElement = Element('cardNumber');
const CardExpiryElement = Element('cardExpiry');
const CardCvcElement = Element('cardCvc');
const CardCVCElement = CardCvcElement; // deprecated in favor of CardCvcElement which better matches Elements API
const IbanElement = Element('iban');
const IdealBankElement = Element('idealBank');

export {
  StripeProvider,
  injectStripe,
  Elements,
  CardElement,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  CardCVCElement,
  PaymentRequestButtonElement,
  IbanElement,
  IdealBankElement,
};
