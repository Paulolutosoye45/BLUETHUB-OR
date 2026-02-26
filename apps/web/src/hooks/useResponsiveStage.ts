import { useEffect, useRef, useState } from "react";

export function useResponsiveStage(minWidth = 400, minHeight = 400) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({
    width: minWidth,
    height: minHeight,
  });

  useEffect(() => {
    const element = parentRef.current;
    if (!element) return;

    const updateDimensions = () => {
      const rect = element.getBoundingClientRect();
      setDimensions({
        width: Math.max(rect.width - 14, minWidth),
        height: Math.max(rect.height - 14, minHeight),
      });
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [minWidth, minHeight]);

  return { parentRef, dimensions };
}