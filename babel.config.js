module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {          // ★ 추가
      moduleName: '@env',
      path: '.env',                           // 기본값이라면 생략 가능
      safe: false,
      allowUndefined: false,
    }],
  ],
};
