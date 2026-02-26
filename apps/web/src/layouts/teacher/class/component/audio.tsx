import { Button } from "@bluethub/ui-kit"
import OffMicIcon from "@/assets/svg/off-mic.svg?react";
import MicIcon from "@/assets/svg/mic.svg?react";
import { useDispatch, useSelector } from "react-redux";
import { useGlobalTimer } from "@/hooks/useGlobalTimer";
import type { RootState } from "@/store";
import { addAudio } from "@/services/class";
import { clearSendQueueRefList, setIsRecording, setSessionIdRef } from "@/store/class-action-slice";
import { useEffect, useRef } from "react";
import { nextTime, saveActions, SEND_INTERVAL } from "@/utils";
import toast from 'react-hot-toast';

const Audio = () => {
    const dispatch = useDispatch();
    const sessionIdRef = useRef<string | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const batchCounterRef = useRef<number>(0);
    const recorderRef = useRef<MediaRecorder | null>(null);


    const isRecording = useSelector((state: RootState) => state.action.isRecording);
    const sendQueueRefList = useSelector((state: RootState) => state.action.sendQueueRefList);

    const timer = useGlobalTimer({
        onTargetReached: () => {
            console.log("⏱️ Timer finished");
            stopRecording();
        },
    });

    const flushBatch = async () => {
        // Just save the action metadata
        const startTime = nextTime();
        const endTime = startTime + 10;

        saveActions({
            totalDuration: SEND_INTERVAL,
            hasAudio: isRecording,
            hasBoard: Boolean(sendQueueRefList.length),
            startTime: startTime.toString(),
            endTime: endTime.toString(),
        });

        // Clear the queue since strokes are already saved
        dispatch(clearSendQueueRefList());
    };

    // ✅ Board stroke batching interval
    useEffect(() => {
        if (!isRecording) return;
        const interval = setInterval(() => {
            flushBatch();
        }, SEND_INTERVAL);
        return () => clearInterval(interval);
    }, [isRecording, sendQueueRefList]); // ✅ or wrap flushBatch in useCallback


    const startRecording = async () => {
        try {
            timer.start();
            toast.success('audio is been recorded ')
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

        } catch (err) {
            timer.stop();
            console.error("❌ Recording failed:", err);
            toast.error(`Recording failed ${err}`)
        }
    };

    const startNewBatch = (stream: MediaStream) => {
        const mimeType = getSupportedMimeType();

        const recorder = new MediaRecorder(stream, {
            mimeType: mimeType,
            audioBitsPerSecond: 128000,
        });

        recorderRef.current = recorder;
        const batchStartTime = Date.now();

        recorder.ondataavailable = async (event) => {
            if (!event.data || event.data.size === 0) {
                console.warn("⚠️ Empty audio data received");
                return;
            }

            const blob = event.data;
            const actualDuration = Date.now() - batchStartTime;


            await addAudio({
                id: crypto.randomUUID(),
                type: "audio",
                sessionId: sessionIdRef.current!,
                batchId: batchCounterRef.current,
                timestamp: Date.now(),
                blob: blob,
                duration: actualDuration / 1000,
                size: blob.size,
            });
            batchCounterRef.current++;
        };

        recorder.onstop = () => {
            if (streamRef.current && streamRef.current.active) {
                startNewBatch(streamRef.current);
            }
        };

        recorder.onerror = (event) => {
            console.error("❌ MediaRecorder error:", event);
            toast.error('MediaRecorder error')
        };

        recorder.start();

        // ✅ Auto-stop after 10 seconds
        setTimeout(() => {
            if (recorder.state === "recording") {
                recorder.stop();
            }
        }, SEND_INTERVAL);
    };

    const stopRecording = async () => {

        // Stop current recorder
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
            recorderRef.current.stop();
        }

        // Stop all audio tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((track) => track.stop());
        }

        // Flush remaining board strokes
        await flushBatch();

        dispatch(setIsRecording(false))
        timer.stop();

        toast.success('audio stopped')
    };

    const getSupportedMimeType = (): string => {
        const types = [
            "audio/webm;codecs=opus", // Chrome, Edge
            "audio/ogg;codecs=opus", // Firefox
            "audio/mp4;codecs=mp4a.40.2", // Safari (AAC)
            "audio/webm", // Fallback
        ];

        const supported = types.find((type) => MediaRecorder.isTypeSupported(type));

        if (!supported) {
            console.warn("⚠️ No ideal codec supported, using default");
            return "";
        }

        return supported;
    };

    const handleMic = async () => {
    isRecording ? await stopRecording() : await startRecording()
}

    return (
        <Button
            onClick={handleMic}
            className="cursor-pointer bg-white drop-shadow-xl rounded-full size-14 flex items-center justify-center"
        >
            {!isRecording ? (
                <OffMicIcon className="size-4 text-[#1EE23E]" />
            ) : (
                <MicIcon className="size-4 text-[#1EE23E]" />
            )}
        </Button>
    )
}

export default Audio