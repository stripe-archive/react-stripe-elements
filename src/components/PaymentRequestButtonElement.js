// @flow
import React from 'react';
import PropTypes from 'prop-types';
import shallowEqual from '../utils/shallowEqual';
import type {ElementContext} from './Elements';

type Props = {
  className: string,
  elementRef: Function,
  onBlur: Function,
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
    className,
    elementRef,
    paymentRequest,
    onReady,
    onFocus,
    onBlur,
    ...options
  } = props;
  return options;
};

class PaymentRequestButtonElement extends React.Component<Props> {
  static propTypes = {
    className: PropTypes.string,
    elementRef: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onReady: PropTypes.func,
    paymentRequest: PropTypes.shape({
      canMakePayment: PropTypes.func.isRequired,
      on: PropTypes.func.isRequired,
      show: PropTypes.func.isRequired,
    }).isRequired,
  };
  static defaultProps = {
    className: '',
    elementRef: noop,
    onBlur: noop,
    onFocus: noop,
    onReady: noop,
  };

  static contextTypes = {
    elements: PropTypes.object.isRequired,
    registerElement: PropTypes.func.isRequired,
    unregisterElement: PropTypes.func.isRequired,
  };

  constructor(props: Props, context: ElementContext) {
    super(props, context);

    const options = _extractOptions(props);
    this._element = this.context.elements.create('paymentRequestButton', {
      paymentRequest: props.paymentRequest,
      ...options,
    });
    this._options = options;
    this._element.on('ready', () => {
      this.props.elementRef(this._element);
      this.props.onReady();
    });
    this._element.on('blur', (...args) => this.props.onBlur(...args));
    this._element.on('focus', (...args) => this.props.onFocus(...args));
  }

  componentDidMount() {
    this._element.mount(this._ref);
  }
  componentWillReceiveProps(nextProps: Props) {
    if (this.props.paymentRequest !== nextProps.paymentRequest) {
      console.warn(
        'Unsupported prop change: paymentRequest is not a customizable property.'
      );
    }
    const options = _extractOptions(nextProps);
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
    return <div className={this.props.className} ref={this.handleRef} />;
  }
}

export default PaymentRequestButtonElement;
