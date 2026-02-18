import { Button } from "@bluethub/ui-kit";
import TimeIcon from "@/assets/svg/time-fill.svg?react";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState, useCallback } from "react";
import type { RootState } from "@/store";
import { holdCurrentTime, setTimeUp } from "@/store/class-action-slice";
import { formatTime, parseTime } from "@/utils";

const Time = () => {
  const dispatch = useDispatch();
  const classDuration = useSelector(
    (state: RootState) => state.action.classDuration
  );

  const timeUp = useSelector((state: RootState) => state.action.timeUp);
  const pauseTime = useSelector((state: RootState) => state.action.pauseTime);


  const [timeLeft, setTimeLeft] = useState(parseTime(classDuration));
  // const [isPaused, __] = useState(false);



  // Dispatch current time whenever timeLeft changes
  const formattedTime = useCallback(
    () => formatTime(timeLeft),
    [timeLeft]
  );

  useEffect(() => {
    dispatch(holdCurrentTime(formattedTime()));
  }, [formattedTime, dispatch]);

  // Start countdown
  useEffect(() => {
    if (timeLeft <= 0 || pauseTime) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Time's up
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, pauseTime]);

  useEffect(() => {
    if (timeLeft === 5 * 60) {
      console.log("5 minutes left");
      dispatch(setTimeUp());
    }
    if (timeLeft === 0) console.log("time up");
  }, [timeLeft, dispatch]);

  useEffect(() => {
    const newTimeInSeconds = parseTime(classDuration);
    setTimeLeft(newTimeInSeconds);
  }, [classDuration]);

  const currentFormattedTime = formatTime(timeLeft);

  return (
    <div>
      <Button
        className={`group flex items-center gap-2 cursor-pointer transition-colors duration-200 w-[170%]
      ${timeUp
            ? "bg-transparent border border-[#EC1B2C] text-[#EC1B2C] hover:bg-[#EC1B2C] hover:text-white"
            : "bg-bLemon text-white hover:bg-bLemon/80"
          } ${pauseTime && "bg-[#ff0000] text-white hover:bg-red-700"}`}
      >
        <TimeIcon
          className={`size-5 transition-colors duration-200
        ${timeUp ? "text-[#EC1B2C] group-hover:text-white" : "text-white"}`}
        />
        <span
          className={`font-Poppins font-semibold text-sm leading-[100%] transition-colors duration-200
        ${timeUp ? "text-[#EC1B2C] group-hover:text-white" : "text-white"}`}
        >
          {currentFormattedTime}
        </span>
      </Button>
    </div>

  );
};

export default Time;
