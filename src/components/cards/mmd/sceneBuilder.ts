import type {
  AbstractEngine,
  ISceneLoaderProgressEvent,
} from "@babylonjs/core";
import {
  Color3,
  Color4,
  CreateGround,
  DirectionalLight,
  HemisphericLight,
  LoadAssetContainerAsync,
  Scene,
  SceneLoader,
  ShadowGenerator,
  SpotLight,
  SSAORenderingPipeline,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { ShadowOnlyMaterial } from "@babylonjs/materials";
import {
  BpmxLoader,
  BvmdLoader,
  getMmdWasmInstance,
  MmdAnimation,
  MmdCamera,
  MmdMesh,
  MmdWasmAnimation,
  MmdWasmInstance,
  MmdWasmInstanceTypeSPR,
  MmdWasmPhysics,
  MmdWasmRuntime,
  registerDxBmpTextureLoader,
  SdefInjector,
  StreamAudioPlayer,
} from "babylon-mmd";
import type { AssetsPath, ISceneBuilder } from "./baseRuntime.ts";

const initializeEngine = (engine: AbstractEngine): void => {
  SdefInjector.OverrideEngineCreateEffect(engine);
  registerDxBmpTextureLoader();
};

const setupScene = (scene: Scene): void => {
  scene.clearColor = new Color4(0.957, 0.961, 0.969, 1.0);
  scene.ambientColor = new Color3(0.3, 0.3, 0.3);
};

const createMmdRoot = (scene: Scene): TransformNode => {
  const mmdRoot = new TransformNode("mmdRoot", scene);
  mmdRoot.position.z = 20;
  return mmdRoot;
};

const createMmdCamera = (scene: Scene, mmdRoot: TransformNode): MmdCamera => {
  const mmdCamera = new MmdCamera("mmdCamera", new Vector3(0, 10, 0), scene);
  mmdCamera.maxZ = 640;
  mmdCamera.minZ = 1;
  mmdCamera.parent = mmdRoot;
  mmdCamera.inertia = 0.8;
  return mmdCamera;
};

const createAmbientLight = (scene: Scene): HemisphericLight => {
  const ambientLight = new HemisphericLight(
    "ambientLight",
    new Vector3(0, 1, 0),
    scene
  );
  ambientLight.intensity = 0.125;
  ambientLight.diffuse = new Color3(0.69, 0.79, 0.89);
  ambientLight.groundColor = new Color3(0.4, 0.4, 0.4);
  return ambientLight;
};

const createDirectionalLight = (scene: Scene): DirectionalLight => {
  const directionalLight = new DirectionalLight(
    "directionalLight",
    new Vector3(0.5, -1, 1),
    scene
  );
  directionalLight.diffuse = new Color3(0.69, 0.79, 0.89);
  directionalLight.intensity = 0.33;
  directionalLight.autoCalcShadowZBounds = false;
  directionalLight.autoUpdateExtends = false;
  return directionalLight;
};

const createLeftSpotLight = (
  scene: Scene,
  mmdRoot: TransformNode
): SpotLight => {
  const leftSpotLight = new SpotLight(
    "leftSpotLight",
    new Vector3(-20, 40, -50),
    new Vector3(0.5, -0.5, 0.8),
    Math.PI / 5,
    2,
    scene
  );
  leftSpotLight.intensity = 0.44;
  leftSpotLight.diffuse = new Color3(0.98, 0.99, 1);
  leftSpotLight.specular = new Color3(0.2, 0.2, 0.2);
  leftSpotLight.shadowEnabled = true;
  leftSpotLight.parent = mmdRoot;

  return leftSpotLight;
};

const createRightSpotLight = (
  scene: Scene,
  mmdRoot: TransformNode
): SpotLight => {
  const rightSpotLight = new SpotLight(
    "rightSpotLight",
    new Vector3(20, 40, -50),
    new Vector3(-0.5, -0.5, 0.8),
    Math.PI / 5,
    2,
    scene
  );
  rightSpotLight.intensity = 0.44;
  rightSpotLight.diffuse = new Color3(0.98, 0.99, 1);
  rightSpotLight.specular = new Color3(0.2, 0.2, 0.2);
  rightSpotLight.shadowEnabled = true;
  rightSpotLight.parent = mmdRoot;

  return rightSpotLight;
};

const createGround = (
  scene: Scene,
  directionalLight: DirectionalLight,
  mmdRoot: TransformNode
): TransformNode => {
  const ground = CreateGround(
    "ground1",
    { width: 100, height: 100, subdivisions: 2, updatable: false },
    scene
  );
  const shadowOnlyMaterial = new ShadowOnlyMaterial("shadowOnly", scene);
  ground.material = shadowOnlyMaterial;
  shadowOnlyMaterial.activeLight = directionalLight;
  shadowOnlyMaterial.alpha = 0.4;
  ground.receiveShadows = true;
  ground.parent = mmdRoot;
  return ground;
};

const setupAudioPlayer = (
  scene: Scene,
  soundFilePath: string
): StreamAudioPlayer => {
  const audioPlayer = new StreamAudioPlayer(scene);
  audioPlayer.preservesPitch = false;
  audioPlayer.source = soundFilePath;
  return audioPlayer;
};

const updateLoadingProgress = (
  progress: number,
  assetName: string,
  onProgress: ((progress: number, assetName: string) => void) | undefined
): void => {
  if (onProgress) {
    onProgress(progress, assetName);
  }
};

const loadAssets = async (
  scene: Scene,
  assets: AssetsPath,
  onProgress: ((progress: number, assetName: string) => void) | undefined
): Promise<
  [MmdWasmInstance, MmdAnimation, MmdAnimation, MmdMesh, MmdMesh | null]
> => {
  const bvmdLoader = new BvmdLoader(scene);
  bvmdLoader.loggingEnabled = false;
  SceneLoader.RegisterPlugin(new BpmxLoader());

  const totalAssets = assets.stageModelFilePath ? 4 : 3;
  const progressPerAsset = 100 / totalAssets;

  const updateOverallProgress = (
    assetProgress: number,
    assetIndex: number,
    assetText: string
  ) => {
    const startProgress = assetIndex * progressPerAsset;
    const mappedProgress =
      startProgress + (assetProgress * progressPerAsset) / 100;
    updateLoadingProgress(Math.floor(mappedProgress), assetText, onProgress);
  };

  return Promise.all([
    getMmdWasmInstance(new MmdWasmInstanceTypeSPR()),
    bvmdLoader.loadAsync("motion", assets.motionFilePath, (event) => {
      updateOverallProgress(
        Math.floor((event.loaded * 100) / event.total),
        0,
        "Motion"
      );
    }),
    bvmdLoader.loadAsync(
      "cameraMotion",
      assets.cameraMotionFilePath,
      (event) => {
        updateOverallProgress(
          Math.floor((event.loaded * 100) / event.total),
          1,
          "Camera Motion"
        );
      }
    ),
    LoadAssetContainerAsync(assets.modelFilePath, scene, {
      onProgress: (event) => {
        updateOverallProgress(
          Math.floor((event.loaded * 100) / event.total),
          2,
          "Model"
        );
      },
      pluginOptions: {
        mmdmodel: {
          loggingEnabled: false,
        },
      },
    }).then((result) => {
      result.addAllToScene();
      return result.rootNodes[0] as MmdMesh;
    }),
    assets.stageModelFilePath
      ? loadStageModel(
          scene,
          assets.stageModelFilePath,
          (event: ISceneLoaderProgressEvent) => {
            updateOverallProgress(
              Math.floor((event.loaded * 100) / event.total),
              3,
              "Stage Model"
            );
          }
        )
      : Promise.resolve(null),
  ]);
};

const loadStageModel = async (
  scene: Scene,
  stageModelFilePath: string,
  onProgressCallback?: (event: ISceneLoaderProgressEvent) => void
): Promise<MmdMesh | null> => {
  try {
    const result = await LoadAssetContainerAsync(stageModelFilePath, scene, {
      onProgress: onProgressCallback,
      pluginOptions: {
        mmdmodel: {
          loggingEnabled: false,
        },
      },
    });

    result.addAllToScene();

    const rootNode = result.rootNodes[0] as MmdMesh;
    if (rootNode) {
      rootNode.getChildMeshes().forEach((mesh) => {
        mesh.receiveShadows = true;
      });
      return rootNode;
    } else {
      console.error(
        "loadStageModel: Stage model root node is not a TransformNode."
      );
      return null;
    }
  } catch (error) {
    console.error("loadStageModel: Error loading stage model:", error);
    return null;
  }
};

const setupMmdRuntime = (
  scene: Scene,
  wasmInstance: MmdWasmInstance,
  mmdAnimation: MmdAnimation,
  cameraAnimation: MmdAnimation,
  modelMesh: MmdMesh,
  mmdRoot: TransformNode,
  mmdCamera: MmdCamera,
  audioPlayer: StreamAudioPlayer,
  directionalLight: DirectionalLight
): MmdWasmRuntime => {
  const shadowGenerator = new ShadowGenerator(2048, directionalLight, true);
  shadowGenerator.usePercentageCloserFiltering = true;
  shadowGenerator.transparencyShadow = true;
  shadowGenerator.forceBackFacesOnly = true;
  shadowGenerator.frustumEdgeFalloff = 0.1;

  const mmdRuntime = new MmdWasmRuntime(
    wasmInstance,
    scene,
    new MmdWasmPhysics(scene)
  );
  mmdRuntime.loggingEnabled = false;
  mmdRuntime.register(scene);

  mmdRuntime.setAudioPlayer(audioPlayer);
  mmdRuntime.setCamera(mmdCamera);

  const mmdWasmAnimation = new MmdWasmAnimation(
    mmdAnimation,
    wasmInstance,
    scene
  );
  const cameraWasmAnimation = new MmdWasmAnimation(
    cameraAnimation,
    wasmInstance,
    scene
  );

  mmdCamera.addAnimation(cameraWasmAnimation);
  mmdCamera.setAnimation("cameraMotion");

  modelMesh.parent = mmdRoot;

  shadowGenerator.addShadowCaster(modelMesh);

  const mmdModel = mmdRuntime.createMmdModel(modelMesh);
  mmdModel.addAnimation(mmdWasmAnimation);
  mmdModel.setAnimation("motion");

  mmdRuntime.physics?.createGroundModel?.([0]);

  optimizeScene(scene);
  return mmdRuntime;
};

const optimizeScene = (scene: Scene): void => {
  scene.onAfterRenderObservable.addOnce(() => {
    scene.freezeMaterials();

    const meshes = scene.meshes;
    for (let i = 0, len = meshes.length; i < len; ++i) {
      const mesh = meshes[i];
      mesh.freezeWorldMatrix();
      mesh.doNotSyncBoundingInfo = true;
      mesh.isPickable = false;
      mesh.alwaysSelectAsActiveMesh = true;
    }

    scene.skipPointerMovePicking = true;
    scene.skipPointerDownPicking = true;
    scene.skipPointerUpPicking = true;
    scene.skipFrustumClipping = true;
    scene.blockMaterialDirtyMechanism = true;
  });
};

const setupPostProcesses = (scene: Scene, mmdCamera: MmdCamera): void => {
  new SSAORenderingPipeline("ssaoPipeline", scene, {
    ssaoRatio: 0.75,
    combineRatio: 1.0,
  });
  scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline(
    "ssaoPipeline",
    mmdCamera
  );
};

export const buildScene: ISceneBuilder["build"] = async (
  engine: AbstractEngine,
  assets: AssetsPath,
  onProgress?: (progress: number, assetName: string) => void
): Promise<{
  scene: Scene;
  mmdRuntime: MmdWasmRuntime;
  audioPlayer: StreamAudioPlayer;
}> => {
  try {
    initializeEngine(engine);
    const scene = new Scene(engine);

    setupScene(scene);

    const mmdRoot = createMmdRoot(scene);
    const mmdCamera = createMmdCamera(scene, mmdRoot);
    const directionalLight = createDirectionalLight(scene);
    createAmbientLight(scene);
    createGround(scene, directionalLight, mmdRoot);

    createLeftSpotLight(scene, mmdRoot);
    createRightSpotLight(scene, mmdRoot);

    setupPostProcesses(scene, mmdCamera);

    const audioPlayer = setupAudioPlayer(scene, assets.soundFilePath);

    const [wasmInstance, mmdAnimation, cameraAnimation, modelMesh, stageModel] =
      await loadAssets(scene, assets, onProgress);

    if (stageModel) {
      stageModel.parent = mmdRoot;
      stageModel.position = new Vector3(0, 0, 0);
      stageModel.rotation = Vector3.Zero();
    }

    const mmdRuntime: MmdWasmRuntime = setupMmdRuntime(
      scene,
      wasmInstance,
      mmdAnimation,
      cameraAnimation,
      modelMesh,
      mmdRoot,
      mmdCamera,
      audioPlayer,
      directionalLight
    );

    mmdRuntime.seekAnimation(0, true);

    return {
      scene,
      mmdRuntime,
      audioPlayer,
    };
  } catch (error) {
    console.error("Error has occured while building scene:", error);
    throw error;
  }
};
