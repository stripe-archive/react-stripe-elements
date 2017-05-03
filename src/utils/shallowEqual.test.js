// @noflow
import shallowEqual from './shallowEqual';

describe('shallowEqual', () => {
  it('should work', () => {
    expect(shallowEqual({}, {})).toBe(true);
    expect(shallowEqual({a: 1}, {a: 1})).toBe(true);

    expect(shallowEqual({a: 1, b: 2}, {a: 1})).toBe(false);
    expect(shallowEqual({a: {}}, {a: {}})).toBe(false);
    expect(shallowEqual({a: undefined}, {b: undefined})).toBe(false);
  });
});
