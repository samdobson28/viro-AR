// this code is not currently in use


import React, { useState } from "react";
import { StyleSheet } from "react-native";
import {
  ViroARScene,
  ViroText,
  Viro3DObject,
  ViroAmbientLight,
  ViroSpotLight,
  ViroNode,
  ViroTrackingStateConstants,
} from "@reactvision/react-viro";

interface Echo3DModel {
  hologram: {
    storageLocation: string;
    filename: string;
    type: string;
    storageID: string;
  };
  additionalData: {
    x?: string;
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
    glbHologramStorageID?: string;
  };
}

interface Echo3DResponse {
  apiKey: string;
  db: {
    [key: string]: Echo3DModel;
  };
}

const HelloWorldSceneAR = () => {
  const [hasARInitialized, setHasARInitialized] = useState(false);
  const [entries, setEntries] = useState<any[]>([]);

  const _onTrackingUpdated = (state: any, reason: any) => {
    if (
      !hasARInitialized &&
      state === ViroTrackingStateConstants.TRACKING_NORMAL
    ) {
      const apiKey = global.echoDB.apiKey;
      const db = Object.values(global.echoDB.db);
      parseEcho3DData(apiKey, db);
      setHasARInitialized(true);
    }
  };

  const parseEcho3DData = (apiKey: string, db: Echo3DModel[]) => {
    const parsedEntries: any[] = [];

    for (let entry of db) {
      let srcModel = `https://api.echo3D.com/query?key=${apiKey}&file=`;
      const typeModel = entry.hologram.filename.toLowerCase().split(".").pop();

      switch (entry.hologram.type) {
        case "VIDEO_HOLOGRAM":
        case "IMAGE_HOLOGRAM":
          continue;
        case "MODEL_HOLOGRAM":
          switch (typeModel) {
            case "glb":
              srcModel += entry.hologram.storageID;
              break;
            case "gltf":
            case "obj":
            case "fbx":
              srcModel += entry.additionalData.glbHologramStorageID;
              break;
          }
          break;
      }

      const x = entry.additionalData.x
        ? parseFloat(entry.additionalData.x) * 0.1
        : 0;
      const y = entry.additionalData.y
        ? parseFloat(entry.additionalData.y) * 0.1
        : 0;
      const z = entry.additionalData.z
        ? parseFloat(entry.additionalData.z) * 0.1
        : 0;
      const scale = entry.additionalData.scale
        ? parseFloat(entry.additionalData.scale) * 0.1
        : 0.1;
      const xAngle = entry.additionalData.xAngle
        ? parseFloat(entry.additionalData.xAngle)
        : 0;
      const yAngle = entry.additionalData.yAngle
        ? parseFloat(entry.additionalData.yAngle)
        : 0;
      const zAngle = entry.additionalData.zAngle
        ? parseFloat(entry.additionalData.zAngle)
        : 0;
      let direction = entry.additionalData.direction;
      let spin = false;
      if (direction && (direction === "right" || direction === "left")) {
        spin = true;
        direction = "spinRight";
      }
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

      parsedEntries.push(
        <ViroNode
          key={entry.hologram.storageID}
          position={[x, y - 0.5, z - 0.5]}
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
        </ViroNode>
      );
    }

    setEntries(parsedEntries);
  };

  return (
    <ViroARScene onTrackingUpdated={_onTrackingUpdated}>
      {entries}
      <ViroAmbientLight color="#aaaaaa" influenceBitMask={1} />
    </ViroARScene>
  );
};

export default HelloWorldSceneAR;
