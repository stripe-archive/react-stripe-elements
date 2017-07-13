// @flow
import React from 'react';
import PropTypes from 'prop-types';
import shallowEqual from '../utils/shallowEqual';
import type {ElementContext} from './Elements';

type Props = {
  elementRef: Function,
  onChange: Function,
  onBlur: Function,
  onFocus: Function,
  onReady: Function,

  elements?: mixed,
};

const noop = () => {};

const Element = (type: string, hocOptions: {sourceType?: string} = {}) =>
  class extends React.Component {
    static propTypes = {
      elementRef: PropTypes.func,
      onChange: PropTypes.func,
      onBlur: PropTypes.func,
      onFocus: PropTypes.func,
      onReady: PropTypes.func,

      // For folks loading Stripe.js asynchronously:
      elements: PropTypes.object,
    };
    static defaultProps = {
      elementRef: noop,
      onChange: noop,
      onBlur: noop,
      onFocus: noop,
      onReady: noop,
    };

    static contextTypes = {
      elements: PropTypes.object,
      registerElement: PropTypes.func,
      unregisterElement: PropTypes.func,
    };

    constructor(props: Props, context: ElementContext | {||}) {
      super(props, context);

      const options = this._extractOptions(this.props);

      this._elements = this.context && this.context.elements
        ? this.context.elements
        : this.props.elements;

      if (!this._elements || typeof this._elements.create !== 'function') {
        throw new Error(
          `Element components can only be used within <StripeProvider> and <Elements> components.
If you are loading Stripe.js asynchronously (and thus not using the StripeProvider and Elements components),
please pass an \`elements\` instance (returned by stripe.elements()) to your Element.`
        );
      }

      this._element = this._elements.create(type, options);
      this._setupEventListeners();
      this._options = options;
    }

    componentDidMount() {
      this._element.mount(this._ref);
      if (
        hocOptions.sourceType &&
        this.context &&
        this.context.registerElement
      ) {
        this.context.registerElement(hocOptions.sourceType, this._element);
      }
    }
    componentWillReceiveProps(nextProps: Props) {
      const options = this._extractOptions(nextProps);
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
      this.context &&
        this.context.unregisterElement &&
        this.context.unregisterElement(this._element);
    }
    props: Props;
    context: ElementContext | {||};
    _element: ElementShape;
    _elements: mixed;
    _ref: ?HTMLElement;
    _options: Object;

    _setupEventListeners() {
      this._element.on('ready', () => {
        this.props.elementRef(this._element);
        this.props.onReady();
      });

      this._element.on('change', (change) => {
        this.props.onChange(change);
      });

      this._element.on('blur', (...args) => this.props.onBlur(...args));
      this._element.on('focus', (...args) => this.props.onFocus(...args));
    }

    _extractOptions(props: Props): Object {
      const {
        elementRef,
        onChange,
        onFocus,
        onBlur,
        onReady,
        elements,
        ...options
      } = props;
      return options;
    }

    handleRef = (ref: HTMLElement) => {
      this._ref = ref;
    };
    render() {
      return <span ref={this.handleRef} />;
    }
  };

export default Element;
