import type { CompressedStroke } from "@/utils/constant";
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface classActiveState {
  value: string;
  type: string;
  fillColor: string;
  classDuration: string;
  currentTime: string;
  pauseTime: boolean;
  timeUp: boolean;
  currentBoard: number;
  sessionIdRef: string;
  isRecording: boolean;
  sendQueueRefList: CompressedStroke[]
}

const initialState: classActiveState = {
  value: "SELECT",
  type: "",
  fillColor: "#000000",
  classDuration: "23:45",
  currentTime: "",
  pauseTime: false,
  timeUp: false,
  currentBoard: 1,
  sessionIdRef: "",
  isRecording: false,
  sendQueueRefList : []
};

const ClassActionSlice = createSlice({
  name: "action",
  initialState,
  reducers: {
    onSetAction: (state, action: PayloadAction<string>) => {
      state.value = action.payload;
      state.type = action.payload;
    },
    onSetFillColor: (state, action: PayloadAction<string>) => {
      state.fillColor = action.payload;
    },
    setCurrentTime: (state, action: PayloadAction<string>) => {
      state.classDuration = action.payload;
    },
    holdCurrentTime: (state, action: PayloadAction<string>) => {
      state.currentTime = action.payload;
    },
    pauseCurrentTime: (state) => {
      state.pauseTime = !state.pauseTime;
      state.isRecording = false
    },
    setTimeUp: (state) => {
      state.timeUp = true;
    },
    setCurrentBoard: (state, action: PayloadAction<number>) => {
      state.currentBoard = action.payload;
    },
    setIsRecording: (state, action: PayloadAction<boolean>) => {
      state.isRecording = action.payload;
    },
    setSessionIdRef: (state, action: PayloadAction<string>) => {
      state.sessionIdRef = action.payload;
    },
    setSendQueueRefList: (state, action: PayloadAction<CompressedStroke[]>) => {
        state.sendQueueRefList.push(...action.payload); // batch push
    },
    clearSendQueueRefList: (state) => {
        state.sendQueueRefList = [];
    },

    // endSession : () => {

    // }
  },
});

export const {
  onSetAction,
  onSetFillColor,
  holdCurrentTime,
  pauseCurrentTime,
  setCurrentTime,
  setTimeUp,
  setCurrentBoard,
  setSessionIdRef,
  setIsRecording,
  setSendQueueRefList,
  clearSendQueueRefList
} = ClassActionSlice.actions;
export default ClassActionSlice.reducer;
