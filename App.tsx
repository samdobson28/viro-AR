import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroText,
  ViroTrackingReason,
  ViroTrackingStateConstants,
  Viro3DObject,
} from "@reactvision/react-viro";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const API_KEY = "winter-frost-2822"; // Replace with your Echo3D API key

// Define types for Echo3D response
interface Echo3DModel {
  hologram: {
    storageLocation: string;
    filename: string;
    type: string;
    storageID: string;
  };
  additionalData: {
    x?: string;
    glbHologramStorageID?: string;
  };
}

interface Echo3DResponse {
  apiKey: string;
  db: {
    [key: string]: Echo3DModel;
  };
}

// Extend the global object to include echoDB
declare global {
  var echoDB: Echo3DResponse;
}

const HelloWorldSceneAR = () => {
  const [text, setText] = useState("Initializing AR...");
  const [entries, setEntries] = useState<{ srcFile: string; x: number }[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://api.echo3D.com/query?key=${API_KEY}`
        );
        console.log(
          "Fetching Echo3D data from URL:",
          `https://api.echo3D.com/query?key=${API_KEY}`
        );

        if (!response.ok) {
          console.error("HTTP error! status: " + response.status);
          const responseText = await response.text();
          console.log("Response text:", responseText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const json: Echo3DResponse = await response.json();
        console.log("Fetched Echo3D JSON:", json); // Log the JSON response
        global.echoDB = json; // Save JSON response as a global variable
        parseEcho3DData(global.echoDB);
      } catch (error) {
        console.error("Error fetching Echo3D data:", error);
      }
    };

    fetchData();
  }, []);

  const parseEcho3DData = (data: Echo3DResponse) => {
    console.log("Parsing Echo3D data:", data); // Log the data being parsed
    const entries: { srcFile: string; x: number }[] = [];
    for (let entry of Object.values(data.db)) {
      let srcFile = `https://api.echo3D.com/query?key=${API_KEY}&file=`;
      const typeFile = entry.hologram.filename.toLowerCase().split(".").pop();

      switch (entry.hologram.type) {
        case "VIDEO_HOLOGRAM":
        case "IMAGE_HOLOGRAM":
          srcFile += entry.hologram.storageID;
          break;
        case "MODEL_HOLOGRAM":
          switch (typeFile) {
            case "glb":
              srcFile += entry.hologram.storageID;
              break;
            case "gltf":
            case "obj":
            case "fbx":
              srcFile += entry.additionalData.glbHologramStorageID;
              break;
          }
          break;
      }

      const x = entry.additionalData.x ? parseFloat(entry.additionalData.x) : 0;

      entries.push({ srcFile, x });
    }
    setEntries(entries);
  };

  function onInitialized(state: any, reason: ViroTrackingReason) {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setText("Hello World!");
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      // Handle loss of tracking
    }
  }

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      <ViroText
        text={text}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle}
      />
      {entries.map((entry, index) => (
        <Viro3DObject
          key={index}
          source={{ uri: entry.srcFile }}
          resources={[{ uri: entry.srcFile }]}
          position={[entry.x, 0, -2]}
          scale={[0.1, 0.1, 0.1]}
          type="GLB"
        />
      ))}
    </ViroARScene>
  );
};

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
  f1: { flex: 1 },
  container: { flex: 1 },
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
});

export default App;
