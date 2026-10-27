const preset = require('@react-native/jest-preset');

module.exports = {
  preset: '@react-native/jest-preset',
  // The preset's default pattern only transforms react-native itself;
  // React Navigation, react-native-screens, and react-native-vector-icons
  // ship untranspiled ESM too.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community|-vector-icons)?|@react-navigation|react-native-screens)/)',
  ],
  // Explicitly merge with the preset's own `transform` (specifying this key
  // at all replaces rather than extends the preset's value) to also stub
  // out font files the same way the preset already stubs image assets —
  // react-native-vector-icons requires its .ttf font at import time.
  transform: {
    ...preset.transform,
    '^.+\\.(ttf|otf|woff|woff2)$': require.resolve(
      '@react-native/jest-preset/jest/assetFileTransformer.js',
    ),
  },
};
