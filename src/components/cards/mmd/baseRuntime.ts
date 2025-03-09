import type { AbstractEngine } from "@babylonjs/core/Engines/abstractEngine";
import type { Scene } from "@babylonjs/core/scene";
import type { MmdWasmRuntime, StreamAudioPlayer } from "babylon-mmd";

export interface AssetsPath {
  motionFilePath: string;
  cameraMotionFilePath: string;
  soundFilePath: string;
  modelFilePath: string;
  stageModelFilePath: string | null;
}

export interface ISceneBuilder {
  build(
    engine: AbstractEngine,
    assets: AssetsPath,
    onProgress?: (progress: number, assetName: string) => void
  ): Promise<{
    scene: Scene;
    mmdRuntime: MmdWasmRuntime;
    audioPlayer: StreamAudioPlayer;
  }>;
}

export interface BaseRuntimeInitParams {
  engine: AbstractEngine;
  assets: AssetsPath;
  sceneBuilder: ISceneBuilder;
  sceneBuilderOnProgress?: (progress: number, assetName: string) => void;
}

export interface BaseRuntime {
  run(): void;
  dispose(): void;
  scene: Scene;
  mmdRuntime: MmdWasmRuntime;
  audioPlayer: StreamAudioPlayer;
}

export const createBaseRuntime = async (
  params: BaseRuntimeInitParams
): Promise<BaseRuntime> => {
  const { engine, assets, sceneBuilder, sceneBuilderOnProgress } = params;

  const sceneResult = await sceneBuilder.build(
    engine,
    assets,
    sceneBuilderOnProgress
  );

  const { scene, mmdRuntime, audioPlayer } = sceneResult;

  const onResize = (): void => {
    engine.resize();
  };

  const onTick = (): void => {
    if (scene) {
      scene.render();
    }
  };

  const run = (): void => {
    window.addEventListener("resize", onResize);
    engine.runRenderLoop(onTick);
  };

  const dispose = (): void => {
    window.removeEventListener("resize", onResize);
    engine.stopRenderLoop();
    audioPlayer.dispose();

    scene.meshes.forEach((mesh) => {
      mesh.material?.dispose(true, true);
      mesh.dispose();
    });
    scene.materials.forEach((material) => {
      material.dispose(true, true);
    });
    scene.textures.forEach((texture) => {
      texture.dispose();
    });

    scene.dispose();
    engine.dispose();
  };

  return {
    run,
    dispose,
    scene,
    mmdRuntime,
    audioPlayer,
  };
};
