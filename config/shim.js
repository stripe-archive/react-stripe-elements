// Avoid warnings
global.requestAnimationFrame = (callback) => {
  setTimeout(callback, 0);
};
