// @noflow

import React from 'react';
import {renderToString} from 'react-dom/server';

import {App} from './async';

describe('AsyncApp', () => {
  it('should renderToString without errors', () => {
    expect(() => {
      renderToString(<App />);
    }).not.toThrow();
  });
});
