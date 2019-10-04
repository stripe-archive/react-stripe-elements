// @flow
import React from 'react';
import PropTypes from 'prop-types';
import {type ProviderContext, providerContextTypes} from './Provider';

type Props = {
  children?: any,
};

export type ElementContext = {
  elementsPromise: Promise<ElementsShape>,
};

export const elementContextTypes = {
  elementsPromise: PropTypes.object.isRequired,
};

export default class Elements extends React.Component<Props> {
  static childContextTypes = elementContextTypes;
  static contextTypes = providerContextTypes;
  static defaultProps = {
    children: null,
  };

  constructor(props: Props, context: ProviderContext) {
    super(props, context);
    const {children, ...options} = this.props;
    this._elementsPromise = new Promise((resolve) => {
      if (this.context.tag === 'sync') {
        resolve(this.context.stripe.elements(options));
      } else {
        this.context.addStripeLoadListener((stripe: StripeShape) => {
          resolve(stripe.elements(options));
        });
      }
    });
  }

  getChildContext(): ElementContext {
    return {
      elementsPromise: this._elementsPromise,
    };
  }

  props: Props;
  context: ProviderContext;
  _elementsPromise: Promise<ElementsShape>;

  render() {
    return React.Children.only(this.props.children);
  }
}
