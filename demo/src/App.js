import React, {Component} from 'react';
import Prism from 'prismjs';
import PropTypes from 'prop-types';

import messages from './messages';
import copy from 'copy-to-clipboard';

// Read the raw source code for each file
import CardCode from './components/CardDemo.js?txt';
import SplitCardCode from './components/SplitFieldsDemo.js?txt';
import PaymentRequestCode from './components/PaymentRequestDemo.js?txt';
import IbanCode from './components/IbanDemo.js?txt';
import IdealCode from './components/IdealDemo.js?txt';
import AsyncCode from './components/AsyncDemo.js?txt';

import {
  CardDemo,
  SplitFieldsDemo,
  PaymentRequestDemo,
  IbanDemo,
  IdealDemo,
  AsyncDemo,
} from './components';

import Nav from './components/Nav';

import 'prismjs/components/prism-jsx';

class App extends Component {
  state = {
    messages: messages.messages,
    didCopy: false,
    stripePublicKey: 'pk_test_6pRNASCoBOKtIshFeQd4XMUh',
    result: {},
  };

  static contextTypes = {
    route: PropTypes.string,
    linkHandler: PropTypes.func,
  };

  handleResult = ({error, token, source, paymentRequest}) => {
    if (error) {
      this.setState({result: {title: 'Error', message: error.message}});
    } else if (token) {
      console.log(JSON.stringify(token, null, 4));
      this.setState({
        result: {
          title: 'Received a token to charge',
          message: JSON.stringify(token, null, 4),
        },
      });
      console.log(token);
    } else if (source) {
      this.setState({
        result: {
          title: 'Received a source to charge',
          message: JSON.stringify(source, null, 4),
        },
      });
    } else if (paymentRequest) {
      this.setState({
        result: {
          title: 'Payment request was successful',
          message: JSON.stringify(paymentRequest.token, null, 4),
        },
      });
    } else {
      this.setState({result: {}});
    }
  };

  getElementAndSource = () => {
    switch (this.context.route) {
      case 'card':
        return {element: <CardDemo />, source: CardCode};
      case 'split-card':
        return {element: <SplitFieldsDemo />, source: SplitCardCode};
      case 'payment-request':
        return {
          element: <PaymentRequestDemo />,
          source: PaymentRequestCode,
        };
      case 'iban':
        return {element: <IbanDemo />, source: IbanCode};
      case 'ideal':
        return {element: <IdealDemo />, source: IdealCode};
      case 'async':
        return {element: <AsyncDemo />, source: AsyncCode};
      default:
        return {element: <CardDemo />, source: CardCode};
    }
  };

  tabClicked = (id) => (evt) => {
    evt.preventDefault();
    this.setState({result: {}});
    this.context.linkHandler(id);
  };

  copyCode = () => {
    const {source} = this.getElementAndSource();
    copy(source);
    this.setState({didCopy: true});
    setTimeout(() => {
      this.setState({didCopy: false});
    }, 2000);
  };

  render() {
    const {element, source} = this.getElementAndSource();
    const html = Prism.highlight(source, Prism.languages.jsx, 'jsx');
    const messages = this.state.messages[this.context.route];
    return (
      <div className="app">
        <Nav active={this.context.route} tabClicked={this.tabClicked} />
        <div className="demo">
          <div className="code-container">
            <div className="code-preview">
              <button
                className={
                  this.state.didCopy ? 'copy-button copied' : 'copy-button'
                }
                type="button"
                onClick={this.copyCode}
              >
                {this.state.didCopy ? 'Copied!' : 'Click to Copy'}
              </button>
              <pre>
                <code
                  className="language-jsx"
                  dangerouslySetInnerHTML={{__html: html}}
                />
              </pre>
            </div>
          </div>
          <div className="elements-preview">
            <section className="cell example">
              {React.cloneElement(element, {
                stripePublicKey: this.state.stripePublicKey,
                handleResult: this.handleResult,
              })}
              <p dangerouslySetInnerHTML={{__html: messages.p1}} />
              <p dangerouslySetInnerHTML={{__html: messages.p2}} />
            </section>
            <section className={this.state.result.title ? 'result' : 'hidden'}>
              <h5>{this.state.result.title}</h5>
              <pre>{this.state.result.message}</pre>
            </section>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
