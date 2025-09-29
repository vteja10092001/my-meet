const log = (...args) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(...args);
    }
  };
  
  module.exports = { log };
  