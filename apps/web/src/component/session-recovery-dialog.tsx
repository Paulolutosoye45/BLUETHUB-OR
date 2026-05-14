/**
 * SessionRecoveryDialog
 *
 * Shows when the board page loads and detects an interrupted recording session.
 * Allows the user to continue the session or discard it.
 */

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  Button,
} from "@bluethub/ui-kit";
import type { LocalSession } from "@/utils/constant";

interface SessionRecoveryDialogProps {
  open: boolean;
  session: LocalSession | null;
  onContinue: () => void;
  onDiscard: () => void;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function SessionRecoveryDialog({
  open,
  session,
  onContinue,
  onDiscard,
}: SessionRecoveryDialogProps) {
  if (!session) return null;

  const duration = formatDuration(session.recording.totalDurationMs);
  const startedAt = formatDate(session.recording.startedAt);

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="border border-gray-200 shadow-2xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-semibold text-gray-900">
            Resume Recording?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-600 space-y-3">
            <p>
              An interrupted recording session was found for this lesson.
            </p>
            <div className="bg-gray-50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Topic:</span>
                <span className="font-medium text-gray-900 truncate max-w-[200px]">
                  {session.lesson.topic}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration:</span>
                <span className="font-medium text-gray-900">{duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Started:</span>
                <span className="font-medium text-gray-900">{startedAt}</span>
              </div>
            </div>
            <p className="text-sm">
              Would you like to continue from where you left off?
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={onDiscard}
            className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50"
          >
            Discard
          </Button>
          <Button
            onClick={onContinue}
            className="flex-1 bg-chestnut hover:bg-chestnut/90 text-white"
          >
            Continue Recording
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default SessionRecoveryDialog;
