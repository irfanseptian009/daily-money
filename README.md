# Daily Money Tracker – Simple Offline 💰

A lightweight personal finance tracker mobile app built with React Native (Expo). Track your income and expenses offline with a clean, modern dark UI.

![React Native](https://img.shields.io/badge/React_Native-0.76-blue)
![Expo](https://img.shields.io/badge/Expo-52-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## Features

- ✅ Add income and expense transactions
- ✅ View all transactions sorted by date
- ✅ Balance summary (income, expense, balance)
- ✅ Edit and delete transactions
- ✅ Offline-first with AsyncStorage
- ✅ Dark mode UI
- ✅ AdMob integration ready

## Tech Stack

| Tech | Purpose |
|------|---------|
| React Native + Expo | Mobile framework |
| TypeScript | Type safety |
| NativeWind (TailwindCSS) | Styling |
| AsyncStorage | Local storage |
| React Navigation | Navigation |
| react-native-google-mobile-ads | Monetization |

## Setup Instructions

### Prerequisites

- Node.js >= 18
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio (for emulator) or physical device with Expo Go

### 1. Install Dependencies

```bash
cd daily-money
npm install
```

### 2. Start Development Server

```bash
npx expo start
```

Then:
- Press `a` to open on Android emulator
- Press `i` to open on iOS simulator (macOS only)
- Scan QR code with Expo Go app on your phone

### 3. Create Asset Placeholders

Create a simple `assets/` directory with placeholder icons:
```bash
mkdir -p assets
```
You'll need `icon.png` (1024x1024), `splash-icon.png` (1284x2778), and `adaptive-icon.png` (1024x1024) in the assets folder.

## How to Build APK

### Option 1: EAS Build (Recommended)

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure EAS
eas build:configure

# Build APK for Android
eas build --platform android --profile preview
```

### Option 2: Local Build

```bash
# Generate native Android project
npx expo prebuild --platform android

# Build APK
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`

## AdMob Configuration

### Where to Put Your AdMob IDs

1. **App ID** → `app.config.js` → `android.config.googleMobileAdsAppId`
2. **Banner Ad Unit ID** → `src/config/ads.ts` → Replace `TEST_BANNER_ANDROID`
3. **Interstitial Ad Unit ID** → `src/config/ads.ts` → Replace `TEST_INTERSTITIAL_ANDROID`

### Current Test IDs (Development Only)

| Ad Type | Test ID |
|---------|---------|
| Banner (Android) | `ca-app-pub-3940256099942544/6300978111` |
| Interstitial (Android) | `ca-app-pub-3940256099942544/1033173712` |
| App ID (Android) | `ca-app-pub-3940256099942544~3347511713` |

> ⚠️ **Important**: AdMob requires a development build (not Expo Go). Use `npx expo run:android` or EAS Build to test ads.

### Enabling Ads in Code

The ads are commented out in `HomeScreen.tsx` and `AddTransactionScreen.tsx`. To enable:

1. Build a development build with `npx expo run:android`
2. Uncomment the ad imports and components in the screen files
3. Ads will show using the IDs from `src/config/ads.ts`

## Project Structure

```
├── App.tsx                    # Entry point + Navigation
├── app.config.js              # Expo config + AdMob
├── metro.config.js            # Metro + NativeWind
├── tailwind.config.js         # TailwindCSS config
├── global.css                 # TailwindCSS directives
└── src/
    ├── types/
    │   └── index.ts           # TypeScript types
    ├── storage/
    │   └── storage.ts         # AsyncStorage CRUD
    ├── hooks/
    │   └── useTransactions.ts # Business logic hook
    ├── config/
    │   └── ads.ts             # AdMob IDs
    ├── components/
    │   ├── BalanceSummary.tsx  # Balance card
    │   ├── TransactionCard.tsx # Transaction item
    │   └── EmptyState.tsx     # Empty list state
    └── screens/
        ├── HomeScreen.tsx     # Main screen
        └── AddTransactionScreen.tsx # Add/Edit form
```

## Publishing to Play Store

1. Replace test AdMob IDs with production IDs
2. Update `app.config.js` with your app details
3. Create app icons and splash screen
4. Build production APK/AAB: `eas build --platform android`
5. Upload to Google Play Console

## License

MIT
