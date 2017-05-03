// @flow
import React from 'react';
import PropTypes from 'prop-types';
import shallowEqual from '../utils/shallowEqual';

type Props = {
  elementRef: Function,
  onError: Function,
  onChange: Function,
  onComplete: Function,
  onBlur: Function,
  onFocus: Function,
  onReady: Function,
};
type Context = {
  elements: ElementsShape,
  registerElement: (type: string, element: ElementShape) => void,
  unregisterElement: (element: ElementShape) => void,
};

const noop = () => {};

const Element = (type: string, hocOptions: {sourceType?: string} = {}) => class extends React.Component {
  static propTypes = {
    elementRef: PropTypes.func,
    onError: PropTypes.func,
    onComplete: PropTypes.func,
    onChange: PropTypes.func,
    onBlur: PropTypes.func,
    onFocus: PropTypes.func,
    onReady: PropTypes.func,
  }
  static defaultProps = {
    elementRef: noop,
    onError: noop,
    onComplete: noop,
    onChange: noop,
    onBlur: noop,
    onFocus: noop,
    onReady: noop,
  }

  static contextTypes = {
    elements: PropTypes.object.isRequired,
    registerElement: PropTypes.func.isRequired,
    unregisterElement: PropTypes.func.isRequired,
  }

  constructor(props: Props, context: Context) {
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
    if (Object.keys(options).length !== 0 && !shallowEqual(options, this._options)) {
      this._options = options;
      this._element.update(options);
    }
  }
  componentWillUnmount() {
    // TODO: should we proxy the Element object so that unmount and destroy are inaccessible?
    this._element.destroy();
    this.context.unregisterElement(this._element);
  }
  props: Props
  context: Context
  _element: ElementShape
  _ref: ?HTMLElement
  _options: Object

  _setupEventListeners() {
    this._element.on('ready', () => {
      this.props.elementRef(this._element);
      this.props.onReady();
    });

    let prevComplete;
    let prevError;
    this._element.on('change', (change) => {
      const {error, complete} = change;
      if (error && prevError !== error) {
        this.props.onError(error);
      }
      if (complete && prevComplete !== complete) {
        this.props.onComplete();
      }

      this.props.onChange(change);
    });

    this._element.on('blur', (...args) => this.props.onBlur(...args));
    this._element.on('focus', (...args) => this.props.onFocus(...args));
  }

  _extractOptions(props: Props): Object {
    const {
      elementRef,
      onError,
      onComplete,
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
  }
  render() {
    return (
      <span ref={this.handleRef} />
    );
  }
};

export default Element;
