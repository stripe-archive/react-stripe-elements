// @flow

import React from 'react';
import {render} from 'react-dom';

import {App} from './async';

const appElement = document.querySelector('.App');
if (appElement) {
  render(<App />, appElement);
}
