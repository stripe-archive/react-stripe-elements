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
      elements: elementsMock,
      registerElement: jest.fn(),
      unregisterElement: jest.fn(),
    };
  });

  it('should pass className to the DOM element', () => {
    const className = 'my-class';
    const CardElement = Element('card', {sourceType: 'card'});
    const element = shallow(<CardElement className={className} />, {context});
    expect(element.first().hasClass(className)).toBeTruthy();
  });

  it('should call the right hooks for a source Element', () => {
    const SourceElement = Element('source', {sourceType: 'foobar'});
    const element = mount(<SourceElement onChange={jest.fn()} />, {context});

    expect(context.registerElement).toHaveBeenCalledTimes(1);
    expect(context.registerElement).toHaveBeenCalledWith('foobar', elementMock);

    element.unmount();
    expect(elementMock.destroy).toHaveBeenCalledTimes(1);
    expect(context.unregisterElement).toHaveBeenCalledTimes(1);
    expect(context.unregisterElement).toHaveBeenCalledWith(elementMock);
  });

  it('should call the right hooks for a non-source Element', () => {
    const SourceElement = Element('source');
    const element = mount(<SourceElement onChange={jest.fn()} />, {context});

    expect(context.registerElement).toHaveBeenCalledTimes(0);

    element.unmount();
    expect(elementMock.destroy).toHaveBeenCalledTimes(1);
    expect(context.unregisterElement).toHaveBeenCalledTimes(1);
    expect(context.unregisterElement).toHaveBeenCalledWith(elementMock);
  });

  it('should call onReady and elementRef', () => {
    const CardElement = Element('card', {sourceType: 'card'});
    const onReadyMock = jest.fn();
    const elementRefMock = jest.fn();
    mount(<CardElement onReady={onReadyMock} elementRef={elementRefMock} />, {
      context,
    });

    expect(elementMock.on.mock.calls[0][0]).toBe('ready');
    expect(elementRefMock).toHaveBeenCalledWith(elementMock);
    expect(onReadyMock).toHaveBeenCalled();
  });

  it('should update the Element when props change', () => {
    const style = {
      base: {
        fontSize: '16px',
      },
    };
    const SourceElement = Element('source', {sourceType: 'foobar'});
    const element = mount(
      <SourceElement onChange={jest.fn()} style={style} />,
      {context}
    );

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
});
