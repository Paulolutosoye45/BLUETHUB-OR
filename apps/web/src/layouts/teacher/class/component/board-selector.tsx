import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { setCurrentBoard, addNewBoard } from "@/store/class-action-slice";
import { Button } from "@bluethub/ui-kit";
import { Plus } from "lucide-react";
import { useSession } from "@/contexts/session-context";

const getRecordingElapsedMs = (timerElapsedSeconds: number, sessionId?: string): number => {
  const recordingSessionId = localStorage.getItem('recordingStartSessionId') ?? '';
  const recordingStartTimerMs = !sessionId || recordingSessionId === sessionId
    ? parseInt(localStorage.getItem('recordingStartTimerMs') ?? '0', 10)
    : 0;
  return Math.max(0, Math.round(timerElapsedSeconds * 1000) - recordingStartTimerMs);
};

const BoardSelector = () => {
  const dispatch = useDispatch();
  const currentBoard = useSelector((state: RootState) => state.action.currentBoard);
  const availableBoards = useSelector((state: RootState) => state.action.availableBoards);
  const timerElapsedSeconds = useSelector((state: RootState) => state.action.timerElapsedSeconds);
  const sessionIdRef = useSelector((state: RootState) => state.action.sessionIdRef);

  const { sendBoardSwitch, isRecording } = useSession();

  const handleBoardSelect = (boardNumber: number) => {
    if (boardNumber !== currentBoard) {
      if (isRecording) {
        const elapsedMs = getRecordingElapsedMs(timerElapsedSeconds, sessionIdRef);
        sendBoardSwitch(currentBoard, boardNumber, elapsedMs);
      }
      dispatch(setCurrentBoard(boardNumber));
    }
  };

  const handleAddNewBoard = () => {
    const nextBoardNumber = Math.max(...availableBoards, 0) + 1;
    if (isRecording) {
      const elapsedMs = getRecordingElapsedMs(timerElapsedSeconds, sessionIdRef);
      sendBoardSwitch(currentBoard, nextBoardNumber, elapsedMs);
    }
    dispatch(addNewBoard());
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {availableBoards.map((boardNumber) => (
          <button
            key={boardNumber}
            onClick={() => handleBoardSelect(boardNumber)}
            className={`flex size-8 items-center justify-center rounded-full text-[11px] font-semibold leading-none text-white transition-colors ${
              currentBoard === boardNumber
                ? "bg-green-600 hover:bg-green-700"
                : "bg-red-600 hover:bg-red-700"
            }`}
            title={`Switch to board B${boardNumber}`}
            aria-label={`Switch to board B${boardNumber}`}
          >
            {boardNumber >= 10 ? "B" : `B${boardNumber}`}
          </button>
        ))}
        <Button
          onClick={handleAddNewBoard}
          size="sm"
          variant="outline"
          className="size-8 rounded-full border-red-300 bg-white p-0 text-red-600 hover:bg-red-50"
          title="Create new board"
        >
          <Plus className="size-3.5" />
        </Button>
      </div>
    </div>
  );
};

export default BoardSelector;
