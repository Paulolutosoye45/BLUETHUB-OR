// hooks/useAudioRecorder.ts

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  clearSendQueueRefList,
  setIsRecording,
  setSessionIdRef,
} from "@/store/class-action-slice";
import { addAudio } from "@/services/class";
import { nextTime, saveActions, SEND_INTERVAL } from "@/utils";
import toast from "react-hot-toast";

export const useAudioRecorder = () => {
  const dispatch = useDispatch();

  const isRecording = useSelector(
    (state: RootState) => state.action.isRecording,
  );

  const sendQueueRefList = useSelector(
    (state: RootState) => state.action.sendQueueRefList,
  );

  const sessionIdRef = useRef<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const batchCounterRef = useRef<number>(0);

  // ===============================
  // Flush board batch
  // ===============================
  const flushBatch = async () => {
    const startTime = nextTime();
    const endTime = startTime + 10;

    saveActions({
      totalDuration: SEND_INTERVAL,
      hasAudio: isRecording,
      hasBoard: Boolean(sendQueueRefList.length),
      startTime: startTime.toString(),
      endTime: endTime.toString(),
    });

    dispatch(clearSendQueueRefList());
  };

  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(() => {
      flushBatch();
    }, SEND_INTERVAL);
    return () => clearInterval(interval);
  }, [isRecording, sendQueueRefList]);

  // ===============================
  // Start new 10s batch
  // ===============================
  const startNewBatch = (stream: MediaStream) => {
    const mimeType = getSupportedMimeType();

    const recorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 128000,
    });

    recorderRef.current = recorder;
    const batchStartTime = Date.now();

    recorder.ondataavailable = async (event) => {
      if (!event.data || event.data.size === 0) return;

      const blob = event.data;
      const duration = (Date.now() - batchStartTime) / 1000;

      await addAudio({
        id: crypto.randomUUID(),
        type: "audio",
        sessionId: sessionIdRef.current!,
        batchId: batchCounterRef.current,
        timestamp: Date.now(),
        blob,
        duration,
        size: blob.size,
      });

      batchCounterRef.current++;
    };

    recorder.onstop = () => {
      if (streamRef.current?.active) {
        startNewBatch(streamRef.current);
      }
    };

    recorder.start();

    setTimeout(() => {
      if (recorder.state === "recording") {
        recorder.stop();
      }
    }, SEND_INTERVAL);
  };

  // ===============================
  // Start Recording
  // ===============================
  const startRecording = async () => {
    try {
      sessionIdRef.current = crypto.randomUUID();
      dispatch(setSessionIdRef(sessionIdRef.current));
      batchCounterRef.current = 0;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 48000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      streamRef.current = stream;

      startNewBatch(stream);

      dispatch(setIsRecording(true));
      toast.success("Audio recording started");
    } catch (err) {
      toast.error("Recording failed");
    }
  };

  // ===============================
  // Stop Recording
  // ===============================
  const stopRecording = async () => {
    if (recorderRef.current?.state !== "inactive") {
      recorderRef.current?.stop();
    }

    streamRef.current?.getTracks().forEach((t) => t.stop());

    await flushBatch();

    toast.success("Audio stopped");
  };

  // ===============================
  // React to Redux isRecording
  // ===============================
  useEffect(() => {
    if (!isRecording && recorderRef.current) {
      stopRecording();
    }
  }, [isRecording]);

  // ===============================
  // Mime support
  // ===============================
  const getSupportedMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/ogg;codecs=opus",
      "audio/mp4;codecs=mp4a.40.2",
      "audio/webm",
    ];

    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "";
  };

  return {
    isRecording,
    startRecording,
    stopRecording,
  };
};
