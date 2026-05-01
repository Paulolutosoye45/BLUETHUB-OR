// hooks/useAudioRecorder.ts

import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "@/store";
import {
  clearSendQueueRefList,
  setIsRecording,
  setSessionIdRef,
} from "@/store/class-action-slice";
import { addAudio } from "@/utils/db";
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

  // Keep a ref that always holds the latest timer elapsed value.
  // We read this AFTER getUserMedia resolves — that is when audio
  // actually starts, not when the mic button was clicked.
  const timerElapsedSeconds = useSelector(
    (state: RootState) => state.action.timerElapsedSeconds,
  );
  const timerElapsedRef = useRef(timerElapsedSeconds);
  useEffect(() => { timerElapsedRef.current = timerElapsedSeconds; }, [timerElapsedSeconds]);

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

  // FIX: removed sendQueueRefList from deps — it caused the interval to reset
  // on every stroke drawn, meaning the board batch NEVER flushed during
  // continuous drawing (the 2-3s sync gap). Now the timer runs undisturbed.
  useEffect(() => {
    if (!isRecording) return;
    const interval = setInterval(flushBatch, SEND_INTERVAL);
    return () => clearInterval(interval);
  }, [isRecording]); // eslint-disable-line react-hooks/exhaustive-deps

  // ===============================
  // Start new 10s batch
  // ===============================
  const startNewBatch = (stream: MediaStream) => {
    const mimeType = getSupportedMimeType();

    // new MediaRecorder() can take 500-1500ms on first call (Opus encoder init).
    // We capture batchStartTime AFTER the constructor so it reflects the actual
    // moment recording begins, not before the codec is ready.
    const recorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: 128000,
    });

    recorderRef.current = recorder;
    let batchStartTime = 0;

    recorder.onstart = () => {
      batchStartTime = Date.now();

      // For the first batch only: save the replay anchor at the actual
      // moment the recorder starts capturing audio.
      if (batchCounterRef.current === 0) {
        localStorage.setItem("sessionStartWallMs", String(batchStartTime));
      }
    };

    recorder.ondataavailable = async (event) => {
      if (!event.data || event.data.size === 0) return;

      const blob = event.data;
      const duration = batchStartTime > 0
        ? (Date.now() - batchStartTime) / 1000
        : SEND_INTERVAL / 1000;

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

      // sessionStartWallMs is written inside startNewBatch (after new MediaRecorder()
      // returns) — that is the most accurate capture point for when audio starts.
      // recordingStartTimerMs is the fallback for the old timerDisplay sync path.
      localStorage.setItem('recordingStartTimerMs', String(Math.round(timerElapsedRef.current * 1000)));

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