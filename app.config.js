module.exports = {
  name: "daily-money-tracker",
  slug: "daily-money-tracker",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "light",
  newArchEnabled: false,
  splash: {
    image: "./assets/splash-icon.png",
    resizeMode: "contain",
    backgroundColor: "#0f172a",
  },
  ios: {
    supportsTablet: false,
    bundleIdentifier: "com.dailymoney.tracker",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#0f172a",
    },
    package: "com.dailymoney.tracker",
  },
  plugins: [
    "expo-font",
    [
      "react-native-google-mobile-ads",
      {
        "androidAppId": "ca-app-pub-3940256099942544~3347511713",
        "iosAppId": "ca-app-pub-3940256099942544~1458002511"
      }
    ],
  ],
  extra: {
    eas: {
      projectId: "1f6bca5a-3d4c-4641-be15-6142a736ace4",
    },
  },
};
