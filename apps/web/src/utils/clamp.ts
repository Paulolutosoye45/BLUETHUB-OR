import type { Position } from "./constant";
import type { circle, rectangle, triangle } from "./Konva";

export const clampToBoard = (
  pos: Position,
  width: number,
  height: number,
): Position => ({
  x: Math.max(0, Math.min(pos.x, width)),
  y: Math.max(0, Math.min(pos.y, height)),
});

export const makeDragBoundFunc =
  (shapeW: number, shapeH: number, boardW: number, boardH: number) =>
  (pos: Position): Position => ({
    x: Math.max(0, Math.min(pos.x, boardW - shapeW)),
    y: Math.max(0, Math.min(pos.y, boardH - shapeH)),
  });

export const clampRect = (
  r: rectangle,
  boardW: number,
  boardH: number,
): rectangle => ({
  ...r,
  x: Math.max(0, Math.min(r.x, boardW - r.width)),
  y: Math.max(0, Math.min(r.y, boardH - r.height)),
});

export const clampCircle = (
  c: circle,
  boardW: number,
  boardH: number,
): circle => ({
  ...c,
  x: Math.max(c.radius, Math.min(c.x, boardW - c.radius)),
  y: Math.max(c.radius, Math.min(c.y, boardH - c.radius)),
});

export const clampTriangle = (
  t: triangle,
  boardW: number,
  boardH: number,
): triangle => ({
  ...t,
  x: Math.max(t.size, Math.min(t.x, boardW - t.size)),
  y: Math.max(t.size, Math.min(t.y, boardH - t.size)),
});
