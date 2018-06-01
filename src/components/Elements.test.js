// @noflow
import React from 'react';
import {mount} from 'enzyme';

import Elements from './Elements';

describe('Elements', () => {
  let stripeMock;

  beforeEach(() => {
    stripeMock = {
      elements: jest
        .fn(() => {
          throw new Error(
            'elements() should not be called twice in this test.'
          );
        })
        .mockReturnValueOnce(true),
      createToken: jest.fn(),
      createSource: jest.fn(),
    };
  });

  it('creates the context', () => {
    const syncContext = {
      tag: 'sync',
      stripe: stripeMock,
    };
    const wrapper = mount(
      <Elements>
        <div />
      </Elements>,
      {context: syncContext}
    );
    const childContext = wrapper.node.getChildContext();
    expect(Object.keys(childContext)).toEqual([
      'addElementsLoadListener',
      'registerElement',
      'unregisterElement',
      'getRegisteredElements',
    ]);
  });

  it('with sync context: addElementsLoadListener returns the same elements instance ', () => {
    const syncContext = {
      tag: 'sync',
      stripe: stripeMock,
    };
    const wrapper = mount(
      <Elements>
        <div />
      </Elements>,
      {context: syncContext}
    );
    const childContext = wrapper.node.getChildContext();

    const mockCallback = jest.fn();
    childContext.addElementsLoadListener(mockCallback);
    expect(mockCallback).toHaveBeenCalledTimes(1);
    expect(mockCallback).toHaveBeenLastCalledWith(true);
    childContext.addElementsLoadListener(mockCallback);
    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenCalledWith(true);
  });

  it('with async context: addElementsLoadListener returns the same elements instance ', () => {
    const asyncContext = {
      tag: 'async',
      addStripeLoadListener: jest.fn((callback) =>
        setTimeout(() => callback(stripeMock), 0)
      ),
    };
    const wrapper = mount(
      <Elements>
        <div />
      </Elements>,
      {context: asyncContext}
    );
    const childContext = wrapper.node.getChildContext();

    const a = new Promise((resolve) =>
      childContext.addElementsLoadListener((first) => {
        expect(first).toEqual(true);
        resolve();
      })
    );
    const b = new Promise((resolve) =>
      childContext.addElementsLoadListener((second) => {
        expect(second).toEqual(true);
        resolve();
      })
    );
    return Promise.all([a, b]);
  });
});
