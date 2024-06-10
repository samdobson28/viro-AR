import React, { useEffect, useState } from "react";
import { StyleSheet } from "react-native";
import {
  ViroARScene,
  ViroText,
  ViroTrackingStateConstants,
  Viro3DObject,
  ViroNode,
  ViroSpotLight,
  ViroQuad,
  ViroAmbientLight,
} from "@reactvision/react-viro";

const API_KEY = "winter-frost-2822"; // Replace with your Echo3D API key.
const FOLDER = "clothes";

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
    y?: string;
    z?: string;
    scale?: string;
    xAngle?: string;
    yAngle?: string;
    zAngle?: string;
    direction?: string;
    text?: string;
    textScale?: string;
    xTextPosition?: string;
    yTextPosition?: string;
    zTextPosition?: string;
    textColor?: string;
    filePath?: string; // Add filePath to additionalData
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

interface State {
  hasARInitialized: boolean;
  text: string;
  apiKey: string;
  db: Echo3DModel[];
}

const HelloWorldSceneAR = () => {
  const [state, setState] = useState<State>({
    hasARInitialized: false,
    text: "Initializing AR...",
    apiKey: "",
    db: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://console.echoar.xyz/query?key=${API_KEY}`
        );
        const responseText = await response.text(); // Read the response as text

        try {
          const json: Echo3DResponse = JSON.parse(responseText); // Parse JSON from text
          global.echoDB = json;
          setState((prevState) => ({
            ...prevState,
            apiKey: json.apiKey,
            db: Object.values(json.db).filter(
              (entry) => entry.additionalData.filePath === FOLDER
            ), // Filter entries by filePath
          }));
          console.log("Fetched Data:", json); // Log fetched data
        } catch (jsonError) {
          console.error(
            "JSON Parse error:",
            jsonError,
            "Response text:",
            responseText
          );
        }
      } catch (error) {
        console.error("Failed to fetch data from Echo3D:", error);
      }
    };

    fetchData();
  }, []);

  const onTrackingUpdated = (
    newState: ViroTrackingStateConstants,
    reason: any
  ) => {
    if (
      !state.hasARInitialized &&
      newState === ViroTrackingStateConstants.TRACKING_NORMAL
    ) {
      setState((prevState) => ({
        ...prevState,
        hasARInitialized: true,
        text: "",
      }));
    }
  };

  const entries = state.db
    .filter((entry) => entry.hologram.type === "MODEL_HOLOGRAM")
    .map((entry, index) => {
      console.log("Filtered Entry:", entry); // Log filtered entries
      let srcModel = `https://console.echoar.xyz/query?key=${state.apiKey}&file=`;
      const typeModel = entry.hologram.filename.toLowerCase().split(".").pop();
      let modelSource;

      if (entry.hologram.type === "MODEL_HOLOGRAM") {
        switch (typeModel) {
          case "glb":
            modelSource = entry.hologram.storageID;
            break;
          case "gltf":
          case "obj":
          case "fbx":
            modelSource = entry.additionalData.glbHologramStorageID;
            break;
          default:
            console.error("Unsupported model type:", typeModel);
            return null;
        }
      }

      srcModel += modelSource;
      console.log("Model Source URI:", srcModel); // Log model source URI

      const x = index * 0.5; // Position models in a row with 0.5 units apart
      const y = 0; // Uniform height
      const z = -1; // Fixed z position for all models
      const scale = 0.1; // Uniform scale for all models
      const xAngle = entry.additionalData.xAngle
        ? parseFloat(entry.additionalData.xAngle)
        : 0;
      const yAngle = entry.additionalData.yAngle
        ? parseFloat(entry.additionalData.yAngle)
        : 0;
      const zAngle = entry.additionalData.zAngle
        ? parseFloat(entry.additionalData.zAngle)
        : 0;
      const direction = entry.additionalData.direction || "";
      const spin =
        direction && (direction === "right" || direction === "left")
          ? true
          : false;
      const textString = entry.additionalData.text || "";
      const textScale = entry.additionalData.textScale
        ? parseFloat(entry.additionalData.textScale) * 0.5
        : 0.5;
      const xTextPosition = entry.additionalData.xTextPosition
        ? parseFloat(entry.additionalData.xTextPosition) * 0.1
        : 0;
      const yTextPosition = entry.additionalData.yTextPosition
        ? parseFloat(entry.additionalData.yTextPosition) * 0.1
        : 0;
      const zTextPosition = entry.additionalData.zTextPosition
        ? parseFloat(entry.additionalData.zTextPosition) * 0.1
        : 0;
      const textColor = entry.additionalData.textColor || "#ffffff";

      const textStyle = StyleSheet.create({
        style: {
          fontFamily: "Arial",
          fontSize: 30,
          color: textColor,
          textAlignVertical: "center",
          textAlign: "center",
        },
      });

      return (
        <ViroNode
          key={index}
          position={[x, y, z]}
          dragType="FixedToWorld"
          onDrag={() => {}}
          animation={{ name: direction, run: spin, loop: true }}
        >
          <ViroText
            text={textString}
            scale={[textScale, textScale, textScale]}
            position={[xTextPosition, yTextPosition, zTextPosition]}
            style={textStyle.style}
          />
          <ViroSpotLight
            innerAngle={5}
            outerAngle={45}
            direction={[0, -1, -0.2]}
            position={[0, 13, 0]}
            color="#ffffff"
            castsShadow={true}
            influenceBitMask={2}
            shadowMapSize={2048}
            shadowNearZ={2}
            shadowFarZ={5}
            shadowOpacity={0.7}
          />
          <Viro3DObject
            source={{ uri: srcModel }}
            position={[0, 0, 0]}
            scale={[scale, scale, scale]}
            rotation={[xAngle, yAngle, zAngle]}
            type="GLB"
            lightReceivingBitMask={5}
            shadowCastingBitMask={2}
          />
          <ViroQuad
            rotation={[-90, 0, 0]}
            width={0.5}
            height={0.5}
            arShadowReceiver={true}
            lightReceivingBitMask={2}
          />
        </ViroNode>
      );
    });

  return (
    <ViroARScene onTrackingUpdated={onTrackingUpdated}>
      {entries}
      <ViroText
        text={state.text}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle}
      />
      <ViroAmbientLight color={"#aaaaaa"} influenceBitMask={1} />
    </ViroARScene>
  );
};

const styles = StyleSheet.create({
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
});

export default HelloWorldSceneAR;
