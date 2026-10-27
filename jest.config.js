module.exports = {
  preset: '@react-native/jest-preset',
  // The preset's default pattern only transforms react-native itself;
  // React Navigation and react-native-screens ship untranspiled ESM too.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-screens)/)',
  ],
};
