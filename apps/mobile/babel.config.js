module.exports = function (api) {
  api.cache(true);
  const path = require('path');
  let appRoot = path.resolve(__dirname, 'src/app');
  if (appRoot.charAt(1) === ':') {
    appRoot = appRoot.charAt(0).toUpperCase() + appRoot.slice(1);
  }
  process.env.EXPO_ROUTER_APP_ROOT = appRoot;
  console.log("BABEL CONFIG IS RUNNING! NORMALIZED APP ROOT:", process.env.EXPO_ROUTER_APP_ROOT);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['nativewind/babel'],
  };
};
