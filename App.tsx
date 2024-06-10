import React from "react";
import { StyleSheet, View, LogBox } from "react-native";
import { ViroARSceneNavigator } from "@reactvision/react-viro";
import HelloWorldSceneAR from "./HelloWorldSceneAR";

// this error was annoying me :0
LogBox.ignoreLogs([
  "RCTBridge required dispatch_sync to load RCTAccessibilityManager",
]);

const App = () => {
  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        autofocus={true}
        initialScene={{
          scene: HelloWorldSceneAR,
        }}
        style={styles.f1}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  f1: { flex: 1 },
});

export default App;
