# Viro AR React Native Typescript app integrated with Echo3D

## Getting Started

> **Note**: Make sure you have completed the [React Native - Environment Setup](https://reactnative.dev/docs/environment-setup) instructions. And have the latest XCode installed.

## Step 1: Install Dependencies

```bash
npm install
```

### iOS only:

```bash
cd ios
pod install
cd ..
```

## Step 2: Start the Metro Server

First, you will need to start **Metro**, the JavaScript _bundler_ that ships _with_ React Native.

To start Metro, run the following command from the _root_ of your React Native project:

```bash
npm start
```
Keep this dev server running before launching the app in XCode.

## Step 3: Start your Application

> **Warning**: Due to limitations of the Apple Simulator and the Android Emulator, you must run your project on a physical device.
> **NOTE**: This requires an Apple Developer Account. You need to add your signing certificate / Apple ID to signing and capabilities in XCode.

Let Metro Bundler run in its _own_ terminal. Open a _new_ terminal from the _root_ of your React Native project. Run the following command to start your _Android_ or _iOS_ app:

```bash
# iOS
npx react-native run-ios
# Android
npx react-native run-android
```

If everything is set up _correctly_, you should see your new app running on you device.

## Viro Documentation

See [here](https://viro-community.readme.io/).
