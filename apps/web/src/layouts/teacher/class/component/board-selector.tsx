import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "@/store";
import { setCurrentBoard, addNewBoard } from "@/store/class-action-slice";
import { Button } from "@bluethub/ui-kit";
import { Plus } from "lucide-react";

const BoardSelector = () => {
  const dispatch = useDispatch();
  const currentBoard = useSelector((state: RootState) => state.action.currentBoard);
  const availableBoards = useSelector((state: RootState) => state.action.availableBoards);

  const handleBoardSelect = (boardNumber: number) => {
    dispatch(setCurrentBoard(boardNumber));
  };

  const handleAddNewBoard = () => {
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
