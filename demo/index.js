// @flow
/* eslint-disable no-console, react/no-multi-comp */
import React from 'react';
import ReactDOM from 'react-dom';

import BasicApp from './BasicApp';
import AsyncApp from './AsyncApp';

const Combined = () => {
  return (
    <div>
      <BasicApp />
      <AsyncApp />
    </div>
  );
};

ReactDOM.render(<Combined />, document.querySelector('.App'));
