// Backed by a real native module with no device/simulator present in the
// Jest environment, so every screen/component that (transitively) imports
// it needs this automatically-applied manual mock rather than a real one.
const { View } = require('react-native');

module.exports = {
  isLiquidGlassSupported: false,
  LiquidGlassView: View,
};
