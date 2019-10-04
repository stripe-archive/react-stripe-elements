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

const Element = (type: string) =>
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
      this._elementPromise = new Promise((resolve) => {
        this._resolveElementPromise = resolve;
      });
      // We keep track of the extracted options on this._options to avoid re-rendering.
      // (We would unnecessarily re-render if we were tracking them with state.)
      this._options = options;
    }

    componentDidMount() {
      this.context.elementsPromise.then((elements) => {
        const element = elements.create(type, this._options);
        this._element = element;

        this._setupEventListeners(element);

        element.mount(this._ref);
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
      }
    }

    getElement = () => {
      return this._elementPromise;
    };

    _resolveElementPromise: (ElementShape) => void;
    _elementPromise: Promise<ElementShape>;
    _element: ElementShape | null;
    _ref: ?HTMLElement;
    _options: Object;
    context: ElementContext;

    _setupEventListeners(element: ElementShape) {
      element.on('ready', () => {
        this.props.onReady(this._element);
        this._resolveElementPromise(element);
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
