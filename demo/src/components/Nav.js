import React, {Component} from 'react';

class Nav extends Component {
  state = {
    tabs: [
      {id: 'card', text: 'Card'},
      {id: 'split-card', text: 'Card (Split Form)'},
      {id: 'payment-request', text: 'Payment Request'},
      {id: 'iban', text: 'IBAN'},
      {id: 'ideal', text: 'iDEAL Bank'},
      {id: 'async', text: 'Async Elements'},
    ],
  };
  render() {
    const tabs = this.state.tabs;
    const activeTab = this.props.active;
    return (
      <header className="header">
        <h2>Stripe React Elements</h2>
        <ul className="optionList" role="tablist">
          {tabs.map((tab) => {
            return (
              <li
                key={tab.id}
                role="tab"
                aria-selected={tab.id === activeTab}
                className={tab.id === activeTab ? 'active' : ''}
                onClick={this.props.tabClicked(tab.id)}
              >
                <a href={tab.id}>{tab.text}</a>
              </li>
            );
          })}
        </ul>
      </header>
    );
  }
}

export default Nav;
