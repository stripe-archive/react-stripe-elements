// @flow
import React from 'react';
import PropTypes from 'prop-types';
import isEqual from '../utils/isEqual';
import {type ElementContext, elementContextTypes} from './Elements';

type Props = {
  id?: string,
  className?: string,
  onChange: Function,
  onBlur: Function,
  onFocus: Function,
  onReady: Function,
};

const noop = () => {};

const _extractOptions = (props: Props): Object => {
  const {id, className, onChange, onFocus, onBlur, onReady, ...options} = props;
  return options;
};

const capitalized = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const Element = (
  type: string,
  hocOptions: {
    impliedTokenType?: string,
    impliedSourceType?: string,
    impliedPaymentMethodType?: string,
  } = {}
) =>
  class extends React.Component<Props> {
    static propTypes = {
      id: PropTypes.string,
      className: PropTypes.string,
      onChange: PropTypes.func,
      onBlur: PropTypes.func,
      onFocus: PropTypes.func,
      onReady: PropTypes.func,
    };
    static defaultProps = {
      id: undefined,
      className: undefined,
      onChange: noop,
      onBlur: noop,
      onFocus: noop,
      onReady: noop,
    };

    static contextTypes = elementContextTypes;

    static displayName = `${capitalized(type)}Element`;

    constructor(props: Props, context: ElementContext) {
      super(props, context);

      this._element = null;

      const options = _extractOptions(this.props);
      // We keep track of the extracted options on this._options to avoid re-rendering.
      // (We would unnecessarily re-render if we were tracking them with state.)
      this._options = options;
    }

    componentDidMount() {
      this.context.addElementsLoadListener((elements: ElementsShape) => {
        if (!this._ref) {
          return;
        }

        const element = elements.create(type, this._options);
        this._element = element;

        this._setupEventListeners(element);

        element.mount(this._ref);

        // Register Element for automatic token / source / paymentMethod creation
        this.context.registerElement(
          element,
          hocOptions.impliedTokenType,
          hocOptions.impliedSourceType,
          hocOptions.impliedPaymentMethodType
        );
      });
    }

    componentDidUpdate() {
      const options = _extractOptions(this.props);
      if (
        Object.keys(options).length !== 0 &&
        !isEqual(options, this._options)
      ) {
        this._options = options;
        if (this._element) {
          this._element.update(options);
        }
      }
    }

    componentWillUnmount() {
      if (this._element) {
        const element = this._element;
        element.destroy();
        this.context.unregisterElement(element);
      }
    }

    context: ElementContext;
    _element: ElementShape | null;
    _ref: ?HTMLElement;
    _options: Object;

    _setupEventListeners(element: ElementShape) {
      element.on('ready', () => {
        this.props.onReady(this._element);
      });

      element.on('change', (change) => {
        this.props.onChange(change);
      });

      element.on('blur', (...args) => this.props.onBlur(...args));
      element.on('focus', (...args) => this.props.onFocus(...args));
    }

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
  };

export default Element;
