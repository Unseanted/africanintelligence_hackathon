module.exports = function (api) {
  api.cache(true);
  return {
  presets: ['babel-preset-expo', '@babel/preset-env', '@babel/preset-react'],
  plugins: [
  'react-native-reanimated/plugin',
  ['module:react-native-dotenv', {
  moduleName: 'react-native-dotenv',
  path: '.env.local',
  blocklist: null,
  whitelist: null,
  blacklist: null,
  process: true,
  ignoreStub: true,
  allowUndefined: true,
  }]
  ]
  };
 };