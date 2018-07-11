// @noflow
import React from 'react';
import {mount, shallow} from 'enzyme';

import Element from './Element';

describe('Element', () => {
  let elementMock;
  let elementsMock;
  let context;
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
  });

  it('should pass id to the DOM element', () => {
    const id = 'my-id';
    const CardElement = Element('card', {
      impliedTokenType: 'card',
      impliedSourceType: 'card',
    });
    const element = shallow(<CardElement id={id} />, {context});
    expect(element.find('#my-id').length).toBe(1);
  });

  it('should pass className to the DOM element', () => {
    const className = 'my-class';
    const CardElement = Element('card', {
      impliedTokenType: 'card',
      impliedSourceType: 'card',
    });
    const element = shallow(<CardElement className={className} />, {context});
    expect(element.first().hasClass(className)).toBeTruthy();
  });

  it('should call the right hooks for a registered Element', () => {
    const TestElement = Element('test', {
      impliedTokenType: 'foo',
      impliedSourceType: 'bar',
    });
    const element = mount(<TestElement onChange={jest.fn()} />, {context});

    expect(context.registerElement).toHaveBeenCalledTimes(1);
    expect(context.registerElement).toHaveBeenCalledWith(
      elementMock,
      'foo',
      'bar'
    );

    element.unmount();
    expect(elementMock.destroy).toHaveBeenCalledTimes(1);
    expect(context.unregisterElement).toHaveBeenCalledTimes(1);
    expect(context.unregisterElement).toHaveBeenCalledWith(elementMock);
  });

  it('should call the right hooks for a non-registered Element', () => {
    const TestElement = Element('test');
    const element = mount(<TestElement onChange={jest.fn()} />, {context});

    expect(context.registerElement).toHaveBeenCalledTimes(0);

    element.unmount();
    expect(elementMock.destroy).toHaveBeenCalledTimes(1);
    expect(context.unregisterElement).toHaveBeenCalledTimes(1);
    expect(context.unregisterElement).toHaveBeenCalledWith(elementMock);
  });

  it('should call onReady', () => {
    const CardElement = Element('card', {
      impliedTokenType: 'card',
      impliedSourceType: 'card',
    });
    const onReadyMock = jest.fn();

    mount(<CardElement onReady={onReadyMock} />, {
      context,
    });

    expect(elementMock.on.mock.calls[0][0]).toBe('ready');
    expect(onReadyMock).toHaveBeenCalledWith(elementMock);
  });

  it('should update the Element when props change', () => {
    const style = {
      base: {
        fontSize: '16px',
      },
    };
    const TestElement = Element('test', {
      impliedTokenType: 'foo',
      impliedSourceType: 'bar',
    });
    const element = mount(<TestElement onChange={jest.fn()} style={style} />, {
      context,
    });

    expect(elementMock.update).toHaveBeenCalledTimes(0);
    element.setProps({style, onChange: jest.fn()});
    expect(elementMock.update).toHaveBeenCalledTimes(0);

    element.setProps({
      style: {base: {fontSize: '20px'}},
      onChange: jest.fn(),
    });
    expect(elementMock.update).toHaveBeenCalledTimes(1);
    expect(elementMock.update).toHaveBeenCalledWith({
      style: {base: {fontSize: '20px'}},
    });
  });

  it("re-rendering with new props should still work if addElementsLoadListener hasn't fired yet", () => {
    // no-op function so that any registered listeners are never woken up
    context.addElementsLoadListener = () => {};

    const placeholder = 'hello';
    const CardElement = Element('card', {
      impliedTokenType: 'card',
      impliedSourceType: 'card',
    });
    const element = shallow(<CardElement placeholder={placeholder} />, {
      context,
    });

    expect(() => element.setProps({placeholder: 'placeholder'})).not.toThrow();
  });

  it('should have a displayName based on the type argument', () => {
    const TestElement = Element('test');
    expect(TestElement.displayName).toEqual('TestElement');
  });
});
