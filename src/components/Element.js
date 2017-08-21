// @flow
import React from 'react';
import PropTypes from 'prop-types';
import shallowEqual from '../utils/shallowEqual';
import type {ElementContext} from './Elements';

type Props = {
  className: string,
  elementRef: Function,
  onChange: Function,
  onBlur: Function,
  onFocus: Function,
  onReady: Function,
};

const noop = () => {};

const Element = (type: string, hocOptions: {sourceType?: string} = {}) =>
  class extends React.Component {
    static propTypes = {
      className: PropTypes.string,
      elementRef: PropTypes.func,
      onChange: PropTypes.func,
      onBlur: PropTypes.func,
      onFocus: PropTypes.func,
      onReady: PropTypes.func,
    };
    static defaultProps = {
      className: '',
      elementRef: noop,
      onChange: noop,
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

      const options = this._extractOptions(this.props);
      this._element = this.context.elements.create(type, options);
      this._setupEventListeners();
      this._options = options;
    }

    componentDidMount() {
      this._element.mount(this._ref);
      if (hocOptions.sourceType) {
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
      this.context.unregisterElement(this._element);
    }
    props: Props;
    context: ElementContext;
    _element: ElementShape;
    _ref: ?HTMLElement;
    _options: Object;

    _setupEventListeners() {
      this._element.on('ready', () => {
        this.props.elementRef(this._element);
        this.props.onReady();
      });

      this._element.on('change', change => {
        this.props.onChange(change);
      });

      this._element.on('blur', (...args) => this.props.onBlur(...args));
      this._element.on('focus', (...args) => this.props.onFocus(...args));
    }

    _extractOptions(props: Props): Object {
      const {
        className,
        elementRef,
        onChange,
        onFocus,
        onBlur,
        onReady,
        ...options
      } = props;
      return options;
    }

    handleRef = (ref: HTMLElement) => {
      this._ref = ref;
    };
    render() {
      return <div className={this.props.className} ref={this.handleRef} />;
    }
  };

export default Element;
