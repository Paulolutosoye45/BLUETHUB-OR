import { Provider } from "react-redux";
import { store } from "@/store/index";
import Class from "@/pages/teacher/note-board/class";
import AppBar from "./component/app-bar";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "@/contexts/session-context";
import { useEffect, useState } from "react";
import { resetClassRuntime } from "@/store/class-action-slice";
import { forceResetGlobalTimer } from "@/hooks/useGlobalTimer";
import { getInterruptedSessions, cleanupEntireSession } from "@/utils/db";
import type { LocalSession } from "@/utils/constant";
import SessionRecoveryDialog from "@/component/session-recovery-dialog";

// Inner component that has access to Redux dispatch
const ClassRoomInner = () => {
  const [recoverySession, setRecoverySession] = useState<LocalSession | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkForRecovery = async () => {
      // Check if we're continuing from a saved draft (manual continue flow)
      const continueSessionId = localStorage.getItem('continueSessionId');

      if (continueSessionId) {
        // Manual continue flow - let class.tsx handle it
        setIsReady(true);
        return;
      }

      // Check for interrupted sessions (page refresh during recording)
      try {
        const interruptedSessions = await getInterruptedSessions();

        if (interruptedSessions.length > 0) {
          // Found interrupted session - show recovery dialog
          // Use the most recent one
          const mostRecent = interruptedSessions.sort(
            (a, b) => new Date(b.recording.startedAt).getTime() - new Date(a.recording.startedAt).getTime()
          )[0];

          console.log('[ClassRoom] Found interrupted session:', mostRecent.id, 'status:', mostRecent.status);
          setRecoverySession(mostRecent);
          setShowRecoveryDialog(true);
          return;
        }
      } catch (err) {
        console.error('[ClassRoom] Failed to check for interrupted sessions:', err);
      }

      // No recovery needed - reset and start fresh
      forceResetGlobalTimer();
      store.dispatch(resetClassRuntime());
      setIsReady(true);
    };

    checkForRecovery();
  }, []);

  const handleContinueSession = () => {
    if (!recoverySession) return;

    console.log('[ClassRoom] User chose to continue session:', recoverySession.id);

    // Set up for continuation via the existing flow
    localStorage.setItem('continueSessionId', recoverySession.id);
    localStorage.setItem('continueLessonId', recoverySession.lessonId);

    // Also restore activeLesson for the topic display
    const activeLesson = {
      lesson: {
        id: recoverySession.lessonId,
        topic: recoverySession.lesson.topic,
        subTopic: recoverySession.lesson.subTopic,
        aim: recoverySession.lesson.aim,
        subject: {
          name: recoverySession.lesson.subjectName,
        },
        classroom: {
          name: recoverySession.lesson.className,
        },
      },
      startedAt: recoverySession.recording.startedAt,
    };
    sessionStorage.setItem('activeLesson', JSON.stringify(activeLesson));

    setShowRecoveryDialog(false);
    setIsReady(true);
  };

  const handleDiscardSession = async () => {
    if (!recoverySession) return;

    console.log('[ClassRoom] User chose to discard session:', recoverySession.id);

    try {
      // Clean up the interrupted session
      await cleanupEntireSession(recoverySession.id);
    } catch (err) {
      console.error('[ClassRoom] Failed to cleanup session:', err);
    }

    // Reset and start fresh
    forceResetGlobalTimer();
    store.dispatch(resetClassRuntime());

    setShowRecoveryDialog(false);
    setRecoverySession(null);
    setIsReady(true);
  };

  return (
    <>
      <SessionProvider>
        <Toaster position="bottom-center" />

        {/* Recovery Dialog */}
        <SessionRecoveryDialog
          open={showRecoveryDialog}
          session={recoverySession}
          onContinue={handleContinueSession}
          onDiscard={handleDiscardSession}
        />

        {/* Only render the board when ready */}
        {isReady && (
          <>
            <AppBar />
            <div>
              <Class />
            </div>
          </>
        )}
      </SessionProvider>
    </>
  );
};

const ClassRoom = () => {
  return (
    <div className="">
      <Provider store={store}>
        <ClassRoomInner />
      </Provider>
    </div>
  );
};

export default ClassRoom;