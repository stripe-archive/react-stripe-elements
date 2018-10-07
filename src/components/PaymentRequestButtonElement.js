// @flow
import React from 'react';
import PropTypes from 'prop-types';
import shallowEqual from '../utils/shallowEqual';
import {type ElementContext, elementContextTypes} from './Elements';

type Props = {
  id?: string,
  className?: string,
  onBlur: Function,
  onClick: Function,
  onFocus: Function,
  onReady: Function,
  paymentRequest: {
    canMakePayment: Function,
    on: Function,
    show: Function,
  },
};

const noop = () => {};

const _extractOptions = (props: Props): Object => {
  const {
    id,
    className,
    onBlur,
    onClick,
    onFocus,
    onReady,
    paymentRequest,
    ...options
  } = props;
  return options;
};

class PaymentRequestButtonElement extends React.Component<Props> {
  static propTypes = {
    id: PropTypes.string,
    className: PropTypes.string,
    onBlur: PropTypes.func,
    onClick: PropTypes.func,
    onFocus: PropTypes.func,
    onReady: PropTypes.func,
    paymentRequest: PropTypes.shape({
      canMakePayment: PropTypes.func.isRequired,
      on: PropTypes.func.isRequired,
      show: PropTypes.func.isRequired,
    }).isRequired,
  };
  static defaultProps = {
    id: undefined,
    className: undefined,
    onBlur: noop,
    onClick: noop,
    onFocus: noop,
    onReady: noop,
  };

  static contextTypes = elementContextTypes;

  constructor(props: Props, context: ElementContext) {
    super(props, context);

    const options = _extractOptions(props);
    // We keep track of the extracted options on this._options to avoid re-rendering.
    // (We would unnecessarily re-render if we were tracking them with state.)
    this._options = options;
  }

  componentDidMount() {
    this.context.addElementsLoadListener((elements: ElementsShape) => {
      this._element = elements.create('paymentRequestButton', {
        paymentRequest: this.props.paymentRequest,
        ...this._options,
      });
      this._element.on('ready', () => {
        this.props.onReady(this._element);
      });
      this._element.on('focus', (...args) => this.props.onFocus(...args));
      this._element.on('click', (...args) => this.props.onClick(...args));
      this._element.on('blur', (...args) => this.props.onBlur(...args));
      this._element.mount(this._ref);
    });
  }
  componentDidUpdate(prevProps: Props) {
    if (this.props.paymentRequest !== prevProps.paymentRequest) {
      console.warn(
        'Unsupported prop change: paymentRequest is not a customizable property.'
      );
    }
    const options = _extractOptions(this.props);
    if (
      Object.keys(options).length !== 0 &&
      !shallowEqual(options, this._options)
    ) {
      this._options = options;
      this._element.update(options);
    }
  }
  componentWillUnmount() {
    this._element.destroy();
  }

  context: ElementContext;
  _element: ElementShape;
  _ref: ?HTMLElement;
  _options: Object;

  handleRef = (ref: ?HTMLElement) => {
    this._ref = ref;
  };

  render() {
    return (
      <div
        id={this.props.id}
        className={this.props.className}
        ref={this.handleRef}
      />
    );
  }
}

export default PaymentRequestButtonElement;
