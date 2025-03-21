module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@app': './src/app',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@lib': './src/lib',
            '@types': './src/types',
            '@assets': './assets',
            '@config': './config'
          },
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
  