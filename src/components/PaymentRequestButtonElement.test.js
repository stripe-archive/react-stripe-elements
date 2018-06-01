// @noflow
import React from 'react';
import {mount, shallow} from 'enzyme';

import PaymentRequestButtonElement from './PaymentRequestButtonElement';

describe('PaymentRequestButtonElement', () => {
  let elementMock;
  let elementsMock;
  let context;
  let paymentRequestMock;
  beforeEach(() => {
    elementMock = {
      mount: jest.fn(),
      destroy: jest.fn(),
      on: jest.fn((event, cb) => {
        if (event === 'ready') {
          cb();
        }
      }),
      update: jest.fn(),
    };
    elementsMock = {
      create: jest.fn().mockReturnValue(elementMock),
    };
    context = {
      addElementsLoadListener: (fn) => fn(elementsMock),
      registerElement: jest.fn(),
      unregisterElement: jest.fn(),
    };
    paymentRequestMock = {
      canMakePayment: jest.fn(),
      on: jest.fn(),
      show: jest.fn(),
    };
  });

  it('should pass the id to the DOM element', () => {
    const id = 'my-id';
    const element = shallow(
      <PaymentRequestButtonElement
        id={id}
        paymentRequest={paymentRequestMock}
      />,
      {context}
    );
    expect(element.find(`#${id}`)).toBeTruthy();
  });

  it('should pass the className to the DOM element', () => {
    const className = 'my-class';
    const element = shallow(
      <PaymentRequestButtonElement
        className={className}
        paymentRequest={paymentRequestMock}
      />,
      {context}
    );
    expect(element.first().hasClass(className)).toBeTruthy();
  });

  it('should call onReady', () => {
    const onReadyMock = jest.fn();

    mount(
      <PaymentRequestButtonElement
        onReady={onReadyMock}
        paymentRequest={paymentRequestMock}
      />,
      {context}
    );

    expect(elementMock.on.mock.calls[0][0]).toBe('ready');
    expect(onReadyMock).toHaveBeenCalledWith(elementMock);
  });

  it('should not register the Element', () => {
    const element = mount(
      <PaymentRequestButtonElement paymentRequest={paymentRequestMock} />,
      {context}
    );

    expect(context.registerElement).toHaveBeenCalledTimes(0);

    element.unmount();
    expect(elementMock.destroy).toHaveBeenCalledTimes(1);
    expect(context.unregisterElement).toHaveBeenCalledTimes(0);
  });

  it('should update the Element when props change', () => {
    const style = {
      paymentRequestButton: {
        theme: 'dark',
        height: '64px',
        type: 'donate',
      },
    };
    const element = mount(
      <PaymentRequestButtonElement
        paymentRequest={paymentRequestMock}
        style={style}
      />,
      {context}
    );

    expect(elementMock.update).toHaveBeenCalledTimes(0);
    element.setProps({style});
    expect(elementMock.update).toHaveBeenCalledTimes(0);

    element.setProps({
      style: {paymentRequestButton: {height: '64px'}},
    });
    expect(elementMock.update).toHaveBeenCalledTimes(1);
    expect(elementMock.update).toHaveBeenCalledWith({
      style: {paymentRequestButton: {height: '64px'}},
    });
  });

  it('should warn that the paymentRequest prop can not be changed', () => {
    const style = {
      paymentRequestButton: {
        theme: 'dark',
        height: '64px',
        type: 'donate',
      },
    };
    const element = mount(
      <PaymentRequestButtonElement
        paymentRequest={paymentRequestMock}
        style={style}
      />,
      {context}
    );

    expect(elementMock.update).toHaveBeenCalledTimes(0);

    const originalConsoleWarn = global.console.warn;
    const mockConsoleWarn = jest.fn();
    global.console.warn = mockConsoleWarn;

    element.setProps({
      paymentRequest: {
        canMakePayment: jest.fn(),
        on: jest.fn(),
        show: jest.fn(),
      },
    });
    expect(elementMock.update).toHaveBeenCalledTimes(0);
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'Unsupported prop change: paymentRequest is not a customizable property.'
    );

    global.console.warn = originalConsoleWarn;
  });
});
