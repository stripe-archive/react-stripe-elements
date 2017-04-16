// @flow

const shallowEqual = (a: Object, b: Object): boolean => {
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) {
    return false;
  } else {
    return keysA.every((key) => b[key] === a[key]);
  }
};

export default shallowEqual;
