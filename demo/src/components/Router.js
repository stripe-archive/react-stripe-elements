import React, {Component} from 'react';
import PropTypes from 'prop-types';

const getCurrentPath = () => {
  const hash = document.location.hash;
  return hash === '' ? 'card' : hash.substring(hash.lastIndexOf('#') + 1);
};

// A simple Router to control handling the links in the Header.
export class Router extends Component {
  state = {
    route: getCurrentPath(),
  };

  static childContextTypes = {
    route: PropTypes.string,
    linkHandler: PropTypes.func,
  };

  handleLinkClick = (route) => {
    this.setState({route});
    window.history.pushState(null, '', `#${route}`);
  };

  getChildContext() {
    return {
      route: this.state.route,
      linkHandler: this.handleLinkClick,
    };
  }

  componentDidMount() {
    window.onpopstate = () => {
      this.setState({route: getCurrentPath()});
    };
  }

  render() {
    return <div className="router">{this.props.children}</div>;
  }
}
