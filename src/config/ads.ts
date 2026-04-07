import { Platform } from "react-native";

// ============================================
// AdMob Configuration
// ============================================
// Replace these with your REAL AdMob IDs before publishing!
// Current values are Google's official TEST IDs.
// ============================================

const TEST_BANNER_ANDROID = "ca-app-pub-3940256099942544/6300978111";
const TEST_BANNER_IOS = "ca-app-pub-3940256099942544/2934735716";

const TEST_INTERSTITIAL_ANDROID = "ca-app-pub-3940256099942544/1033173712";
const TEST_INTERSTITIAL_IOS = "ca-app-pub-3940256099942544/4411468910";

// ============================================
// TO USE YOUR REAL ADS:
// 1. Replace the values below with your real Ad Unit IDs
// 2. Update the AdMob App ID in app.config.js
// ============================================

export const BANNER_AD_UNIT_ID = Platform.select({
  android: TEST_BANNER_ANDROID,
  ios: TEST_BANNER_IOS,
  default: TEST_BANNER_ANDROID,
});

export const INTERSTITIAL_AD_UNIT_ID = Platform.select({
  android: TEST_INTERSTITIAL_ANDROID,
  ios: TEST_INTERSTITIAL_IOS,
  default: TEST_INTERSTITIAL_ANDROID,
});
