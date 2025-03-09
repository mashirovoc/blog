"use client";

import { Button } from "@/components/ui/button";
import { Engine } from "@babylonjs/core/Engines/engine";
import { StreamAudioPlayer } from "babylon-mmd";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AiOutlineAudio,
  AiOutlineAudioMuted,
  AiOutlineFullscreen,
} from "react-icons/ai";
import { AssetsPath, BaseRuntime, createBaseRuntime } from "./baseRuntime";
import { buildScene } from "./sceneBuilder";

const LOADING_GIF_PATH = "/mmd/towasama_loading.gif";
const MODEL_FILE_PATH = "/mmd/Towa.bpmx";
const MOTION_FILE_PATH = "/mmd/dance.bvmd";
const CAMERA_MOTION_FILE_PATH = "/mmd/camera.bvmd";
const STAGE_MODEL_FILE_PATH = "/mmd/stage.bpmx";
const SOUND_FILE_PATH = "/mmd/sound.mp3";

const Player = () => {
  const drawingAreaRef = useRef<HTMLCanvasElement>(null);
  const [audioPlayer, setAudioPlayer] = useState<StreamAudioPlayer | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isMuted, setMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const loadingPercentRef = useRef<HTMLSpanElement>(null);
  const loadingNameRef = useRef<HTMLSpanElement>(null);
  const baseRuntimeRef = useRef<BaseRuntime | null>(null);

  const toggleVolume = () => {
    if (audioPlayer) {
      setMuted(!isMuted);
      isMuted ? audioPlayer.unmute() : audioPlayer.mute();
    }
  };

  const toggleFullscreen = () => {
    const canvas = drawingAreaRef.current;
    if (canvas) {
      if (!isFullscreen && canvas.requestFullscreen) {
        canvas.requestFullscreen();
        setIsFullscreen(true);
      } else if (isFullscreen && document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    const initializeEngine = async () => {
      const canvas = drawingAreaRef.current;
      if (!canvas) {
        console.error("drawingAreaRef.current is null");
        return;
      }
      const engine = new Engine(canvas, true, {
        preserveDrawingBuffer: false,
        stencil: false,
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      });
      const assets: AssetsPath = {
        modelFilePath: MODEL_FILE_PATH,
        motionFilePath: MOTION_FILE_PATH,
        cameraMotionFilePath: CAMERA_MOTION_FILE_PATH,
        stageModelFilePath: STAGE_MODEL_FILE_PATH,
        soundFilePath: SOUND_FILE_PATH,
      };
      try {
        const runtimeResult = await createBaseRuntime({
          engine,
          assets,
          sceneBuilder: { build: buildScene },
          sceneBuilderOnProgress: (progress: number, assetName: string) => {
            if (loadingPercentRef.current && loadingNameRef.current) {
              loadingPercentRef.current.textContent = String(progress);
              loadingNameRef.current.textContent = assetName;
            }
          },
        });
        runtimeResult.run();
        const { mmdRuntime: r, audioPlayer: ap } = runtimeResult;

        setAudioPlayer(ap);
        ap.mute();
        setIsLoading(false);

        setTimeout(() => {
          r.playAnimation();
          r.onAnimationTickObservable.addOnce(() => {
            const animationDuration = r.animationFrameTimeDuration;
            r.onAnimationTickObservable.add(() => {
              if (r.currentFrameTime >= animationDuration) {
                r.onAnimationTickObservable.removeCallback(() => {});
                setTimeout(() => {
                  r.seekAnimation(0, true).then(() => {
                    r.playAnimation();
                  });
                }, 5000);
              }
            });
          });
        }, 1500);

        baseRuntimeRef.current = runtimeResult;
      } catch (error) {
        console.error("Error initializing engine:", error);
        setIsLoading(false);
      }

      const resizeObserver = new ResizeObserver(() => {
        engine.resize();
      });
      if (canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
      }
      return () => {
        if (baseRuntimeRef.current) {
          baseRuntimeRef.current.dispose();
          baseRuntimeRef.current = null;
        }
        document.removeEventListener(
          "fullscreenchange",
          handleFullscreenChange
        );
        document.removeEventListener(
          "webkitfullscreenchange",
          handleFullscreenChange
        );
      };
    };

    initializeEngine().catch(console.error);

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      if (baseRuntimeRef.current) {
        baseRuntimeRef.current.dispose();
        baseRuntimeRef.current = null;
      }
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  return (
    <div className="relative">
      {audioPlayer && (
        <div className="absolute top-2 right-2 z-10 flex space-x-2">
          <Button onClick={toggleVolume}>
            {isMuted ? <AiOutlineAudioMuted /> : <AiOutlineAudio />}
          </Button>
          <Button onClick={toggleFullscreen}>
            <AiOutlineFullscreen />
          </Button>
        </div>
      )}
      {isLoading && (
        <div className="absolute top-0 bottom-0 left-0 right-0 bg-black/50 flex flex-col justify-center items-center z-50">
          <Image
            src={LOADING_GIF_PATH}
            alt="Loading..."
            width={400}
            height={400}
            className="w-60 h-60 object-cover"
          />
          <p className="text-white mt-4">
            Loading assets...
            <br />
            <span id="loadingName" ref={loadingNameRef}>
              Please wait...
            </span>{" "}
            (
            <span id="loadingPercent" ref={loadingPercentRef}>
              0
            </span>
            %)
          </p>
        </div>
      )}
      <canvas
        id="drawingArea"
        className="w-full h-dvh m-0 p-0 overflow-hidden"
        ref={drawingAreaRef}
      />
    </div>
  );
};

export default Player;
