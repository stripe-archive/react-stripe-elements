import * as React from "react";

interface ProviderProps {
  apiKey: string;
  children?: React.ReactNode;
}

export class StripeProvider extends React.Component<ProviderProps, {}> {}

export function injectStripe<Props extends object>(
  WrappedComponent: React.ComponentClass<Props & StripeProps>,
): React.ComponentClass<Props>;

export interface StripeProps {
  stripe: StripeShape;
}

type CreateTokenResult = {
  token: Token;
  error: void;
} | {
  // TODO: StripeError can be more specific.
  error: any;
  token: void;
};

export interface StripeShape {
  createToken(options: CreateTokenOptions): Promise<CreateTokenResult>;
}

export class Elements extends React.Component<{}, {}> {}
export class CardElement extends React.Component<CardElementOptions, {}> {}
export class CardNumberElement extends React.Component<ElementOptions<void>, {}> {}
export class CardExpiryElement extends React.Component<ElementOptions<void>, {}> {}
export class CardCVCElement extends React.Component<ElementOptions<void>, {}> {}
export class PostalCodeElement extends React.Component<PostalCodeElementOptions, {}> {}

// stripe.js v3 type definitions below.

interface CreateTokenOptions {
  /**
   *  Cardholder name
   */
  name?: string;
  address_line1?: string;
  address_line2?: string;
  address_city?: string;
  address_state?: string;
  address_zip?: string;
  address_country?: string;
  /**
   * Required in order to be able to add the card to a Connect account
   * (in all other cases, this parameter is not used).
   * Currently, the only supported currency for debit card transfers is usd.
   */
  currency?: string;
}

export interface Token {
  /**
   * Unique identifier for the object.
   */
  id: string;

  /**
   * String representing the object’s type. Objects of the same type share the same value.
   */
  object: "token";

  /**
   *  IP address of the client that generated the token.
   */
  client_ip?: string;

  /**
   * Time at which the object was created. Measured in seconds since the Unix epoch.
   */
  created: number;

  /**
   * Flag indicating whether the object exists in live mode or test mode.
   */
  livemode: boolean;

  /**
   * Type of the token: `card`, `bank_account`, `pii`.
   */
  type: "card" | "bank_account" | "pii";

  /**
   * Whether or not this token has already been used (tokens can be used only once).
   */
  used: boolean;

  /**
   * Hash describing the card used to make the charge.
   * See https://stripe.com/docs/api#card_object
   */
  card?: any;

  /**
   * Hash describing the bank account.
   * See https://stripe.com/docs/api#customer_bank_account_object
   */
  bank_account?: any;

  /**
   * The PII this token will represent.
   * See https://stripe.com/docs/api#create_pii_token
   */
  pii?: any;
}

export type CardElementOptions = {
  /**
   * Default is false. If you are already collecting a
   * billing ZIP or postal code on the checkout page, you should set this to true.
   */
  hidePostalCode?: boolean;

  /**
   * Hides any icons in the Element. Default is false.
   */
  hideIcon?: boolean;

  /**
   * Appearance of the icons in the Element.
   */
  iconStyle?: "solid" | "default";
} & ElementOptions<{
  postalCode?: string;
}>;

export type PostalCodeElementOptions = ElementOptions<string>;

interface ElementOptions<Value> {
  /**
   *  Set custom class names on the container DOM element when the
   * Stripe Element is in a particular state.
   */
  classes?: {
    /**
     * The base class applied to the container.
     * Defaults to `StripeElement`.
     */
    base?: string;
    /**
     * The class name to apply when the Element is complete.
     * Defaults to `StripeElement--complete`.
     */
    complete?: string;
    /**
     * The class name to apply when the Element is empty.
     * Defaults to `StripeElement--empty`.
     */
    empty?: string;
    /**
     * The class name to apply when the Element is focused.
     * Defaults to `StripeElement--focus`.
     */
    focus?: string;
    /**
     * The class name to apply when the Element is invalid.
     * Defaults to `StripeElement--invalid`.
     */
    invalid?: string;
    /**
     * The class name to apply when the Element has its value autofilled by the browser
     * (only on Chrome and Safari). Defaults to `StripeElement--webkit-autofill`.
     */
    webkitAutofill?: string;
  };

  /**
   *  Customize appearance using CSS properties.
   */
  style?: ElementStyleOptions & {
    base?: ElementStyleOptions;
    complete?: ElementStyleOptions;
    empty?: ElementStyleOptions;
    invalid?: ElementStyleOptions;
  };

  /**
   *  A pre-filled value (for single-field inputs) or set of values
   * (for multi-field inputs) to include in the input.
   * Note that sensitive card information (card number, CVC, and expiration date)=
   * cannot be pre-filled.
   */
  value?: Value;
}

export interface ElementStylePropertyOptions {
  color?: string;
  fontFamily?: string;
  fontSize?: string;
  fontSmoothing?: string;
  fontStyle?: string;
  fontVariant?: string;
  iconColor?: string;
  lineHeight?: string;
  letterSpacing?: string;
  textDecoration?: string;
  textShadow?: string;
  textTransform?: string;
}

export type ElementStyleOptions = ElementStylePropertyOptions & {
  ":hover"?: ElementStylePropertyOptions;
  ":focus"?: ElementStylePropertyOptions;
  "::placeholder"?: ElementStylePropertyOptions;
  "::selection"?: ElementStylePropertyOptions;
  ":-webkit-autofill"?: ElementStylePropertyOptions;
}
