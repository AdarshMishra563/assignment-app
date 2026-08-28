module.exports = {
  preset: '@react-native/jest-preset',
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|@reduxjs/toolkit|immer|lucide-react-native|toastify-react-native)/',
  ],
};
