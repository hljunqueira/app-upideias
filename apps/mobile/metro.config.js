const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

// Set the Expo Router app root environment variable for Babel workers
process.env.EXPO_ROUTER_APP_ROOT = path.resolve(projectRoot, 'src/app');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files in the monorepo
config.watchFolders = [workspaceRoot];

// 2. Force Metro to resolve dependencies from local first, then root node_modules
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Block list to ignore broken optional dependency symlinks / system packages
config.resolver.blockList = [
  /.*lightningcss-linux-arm64-gnu.*/,
  /.*lightningcss-linux.*/,
  /.*lightningcss-android.*/,
  /.*lightningcss-darwin.*/,
];

// Force Metro to resolve unique copies of React/React Native to prevent duplicate package conflicts
config.resolver.extraNodeModules = {
  react: path.dirname(require.resolve('react', { paths: [projectRoot] })),
  'react-dom': path.dirname(require.resolve('react-dom', { paths: [projectRoot] })),
  'react-native': path.dirname(require.resolve('react-native', { paths: [projectRoot] })),
};

// 3. Force Babel to use the local config
config.transformer.babelConfigPath = path.resolve(projectRoot, 'babel.config.js');

module.exports = config;
