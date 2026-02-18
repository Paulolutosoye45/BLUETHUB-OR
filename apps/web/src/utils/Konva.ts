export const ACTIONS = {
  TEXT: "text",
  PEN: "pen",
  ERASER: "eraser",
  RECTANGLE: "rectangle",
  CIRCLE: "circle",
  ARROW: "arrow",
  SELECT: "SELECT",
  IMAGE: "image",
  TRIANGLE: "triangle",
  LINE: "line",
};


export type Scribble = {
  id: string;
  // unique: string;
  points: number[];
  fillColor: string;
  action: "pen" | "eraser";
};
export type rectangle = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
};

export type triangle = {
  id: string;
  x: number;
  y: number;
  size: number;
  fillColor: string;
  stroke: string;
  strokeWidth: number;
};

export type circle = {
  id: string;
  x: number;
  y: number;
  radius: number;
  fillColor: string;
};

export type text = {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fillColor: string;
};

export type arrow = {
  id: string;
  points: number[];
  fillColor: string;
  stroke: string;
};
export type imageIf = {
  id: string;
  img: HTMLImageElement;
  x: number;
  y: number;
};

export type straightLine = {
  id: string;
  points: number[];
  stroke: string;
  strokeWidth?: number;
  fillColor: string;
};