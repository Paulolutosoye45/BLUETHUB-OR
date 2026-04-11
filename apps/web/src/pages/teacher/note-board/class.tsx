import {
    Stage,
    Layer,
    Line,
    Transformer,
    Rect,
    Circle,
    Arrow,
    RegularPolygon,
    Image as KonvaImage,
} from "react-konva";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getBezierPoints, gzipCompress } from "@/utils/gzip";
import { addStrokes } from "@/utils/db";
import { formatTime, parseTime } from "@/utils";
import type { RootState } from "@/store";
import { holdCurrentTime, setSendQueueRefList } from "@/store/class-action-slice";
import { useDispatch, useSelector } from "react-redux";
import { useGlobalTimer } from "@/hooks/useGlobalTimer";
import { type Position } from "@/utils/constant";
import type Konva from "konva";
import type { Stroke } from "@/utils/constant";
import { ACTIONS, type arrow, type circle, type rectangle, type straightLine, type triangle } from "@/utils/Konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { getCursor } from "@/utils/cursor-display";
import { onSetAction } from "@/store/class-action-slice";
import ClassMenu from "@/layouts/teacher/class/component/class-menu";
import ClassBottom from "@/layouts/teacher/class/component/class-bottom";
import { clampCircle, clampRect, clampToBoard, clampTriangle, makeDragBoundFunc } from "@/utils/clamp";
import type { Box } from "konva/lib/shapes/Transformer";
import useImage from 'use-image';


const Class = () => {
    const dispatch = useDispatch();
    const classDuration = useSelector((state: RootState) => state.action.classDuration);
    const pauseTime = useSelector((state: RootState) => state.action.pauseTime);
    const currentBoard = useSelector((state: RootState) => state.action.currentBoard);
    const actionSelect = useSelector((state: RootState) => state.action.value);
    const selectedFillColor = useSelector((state: RootState) => state.action.fillColor);
    const isRecording = useSelector((state: RootState) => state.action.isRecording);
    const sessionIdRef = useSelector((state: RootState) => state.action.sessionIdRef);
    const selectedImage = useSelector((state: RootState) => state.action.selectedImage);

    const [actions, setAction] = useState<string | null>(ACTIONS.SELECT);
    const [strokes, setStrokes] = useState<Stroke[]>([]);
    const [currentStroke, setCurrentStroke] = useState<number[]>([]);
    const [_, setPosition] = useState<Position>({ x: 0, y: 0 });
    const [straightLines, setStraightLines] = useState<straightLine[]>([]);
    const [rectangles, setRectangles] = useState<rectangle[]>([]);
    const [circles, setCircles] = useState<circle[]>([]);
    const [arrows, setArrows] = useState<arrow[]>([]);
    const [triangles, setTriangles] = useState<triangle[]>([]);
    const [vaderImage] = useImage(selectedImage?.url ?? "");

    const [timeLeft, setTimeLeft] = useState(parseTime(classDuration));
    const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
    const trRef = useRef<Konva.Transformer | null>(null);
    const parentRef = useRef<HTMLDivElement>(null);
    const strokeTimesRef = useRef({ start: "", end: "" });
    const rectRef = useRef(null);
    const isDrawing = useRef(false);
    const strokeColor = "#000";
    const shapeStartPos = useRef<Position | null>(null);
    const activeShapeId = useRef<string | null>(null);
    const isDraggable = actions === ACTIONS.SELECT;

    const boardW = dimensions.width;
    const boardH = dimensions.height;

    // ✅ FIX 1: Track previous formatted time to avoid dispatching every second
    const prevFormattedTimeRef = useRef<string>("");

    useEffect(() => {
        setAction(actionSelect);
    }, [actionSelect]);

    const timer = useGlobalTimer({
        onTargetReached: () => {
            isDrawing.current = false;
        },
    });

    useEffect(() => {
        timer.start();
    }, []);

    useEffect(() => {
        const element = parentRef.current;
        if (!element) return;

        const updateDimensions = () => {
            const rect = element.getBoundingClientRect();
            setDimensions({
                width: Math.max(rect.width - 14, 400),
                height: Math.max(rect.height - 14, 500),
            });
        };

        updateDimensions();
        const resizeObserver = new ResizeObserver(updateDimensions);

        const handleMouseMove = (e: MouseEvent) => {
            const rect = element.getBoundingClientRect();
            const isOverDrawingArea =
                e.clientX >= rect.left &&
                e.clientX <= rect.right &&
                e.clientY >= rect.top &&
                e.clientY <= rect.bottom;

            if (isOverDrawingArea) {
                setPosition({ x: e.clientX, y: e.clientY });
            }
        };

        if (trRef.current && rectRef.current) {
            trRef.current.nodes([rectRef.current]);
        }

        window.addEventListener("mousemove", handleMouseMove);
        resizeObserver.observe(element);

        return () => {
            resizeObserver.disconnect();
            window.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    // ✅ FIX 1: Only dispatch when the formatted string actually changes
    useEffect(() => {
        if (timeLeft <= 0 || pauseTime) return;

        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) return 0;
                const next = prev - 1;
                const formatted = formatTime(next);
                if (formatted !== prevFormattedTimeRef.current) {
                    prevFormattedTimeRef.current = formatted;
                    dispatch(holdCurrentTime(formatted));
                }
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [pauseTime, dispatch]);

    useEffect(() => {
        if (!selectedImage) return;
    }, [selectedImage]);

    /* ✅ FIX 2: Stable dragBoundFunc factories memoized by board dimensions */
    const boardClamp = useCallback(
        (pos: Position) => clampToBoard(pos, boardW, boardH),
        [boardW, boardH]
    );

    /* ---------------- DRAWING ---------------- */
    const shapeDownEvent = useCallback(async (shape: {
        id: string;
        type: "rectangle" | "circle" | "triangle" | "arrow" | "line";
        points?: number[];
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        radius?: number;
        size?: number;
        fillColor?: string;
        stroke?: string;
        strokeWidth?: number;
    }) => {
        const strokeId = isRecording && sessionIdRef ? sessionIdRef : null;
        const startTime = strokeTimesRef.current.start;
        const endTime = strokeTimesRef.current.end;

        const compressed = await gzipCompress(JSON.stringify(shape));
        const base64Data = btoa(String.fromCharCode(...compressed));

        const compressedShape = {
            id: shape.id,
            sessionId: strokeId,
            data: base64Data,
            color: shape.stroke || shape.fillColor || "#df4b26",
            width: shape.strokeWidth || 2,
            type: shape.type,
            timestamp: Date.now(),
            duration: 0,
            currentBoard,
            startTime,
            endTime,
        };

        dispatch(setSendQueueRefList([compressedShape]));

        try {
            if (isRecording) await addStrokes([compressedShape]);
        } catch (err) {
            console.error("❌ Failed to save shape to IndexedDB:", err);
        }
    }, [isRecording, sessionIdRef, currentBoard, dispatch]);

    const penDownEvent = useCallback(async (p: Position | null, type: "stroke" | "eraser" = "stroke") => {
        const eventStartTime = performance.now();

        const updatedStroke = p ? [...currentStroke, p.x, p.y] : currentStroke;

        if (updatedStroke.length < 4) {
            if (p) setCurrentStroke(updatedStroke);
            return;
        }

        const smoothed = getBezierPoints(updatedStroke);
        const compressed = await gzipCompress(JSON.stringify(smoothed));
        const base64Stroke = btoa(String.fromCharCode(...compressed));

        const strokeId = isRecording && sessionIdRef ? sessionIdRef : null;
        const interactionDuration = performance.now() - eventStartTime;

        const newStroke = {
            type,
            id: crypto.randomUUID(),
            points: smoothed,
            color: type === "eraser" ? "#000" : selectedFillColor || "#df4b26",
            width: type === "eraser" ? 30 : 2,
            timestamp: Date.now(),
            duration: interactionDuration,
            startTime: strokeTimesRef.current.start,
            endTime: strokeTimesRef.current.end,
        };

        const compressedStroke = {
            id: newStroke.id,
            sessionId: strokeId,
            data: base64Stroke,
            color: newStroke.color,
            width: newStroke.width,
            type,
            timestamp: newStroke.timestamp,
            duration: newStroke.duration,
            currentBoard,
            startTime: newStroke.startTime,
            endTime: newStroke.endTime,
        };

        setStrokes((prev) => [...prev, newStroke]);
        dispatch(setSendQueueRefList([compressedStroke]));

        try {
            if (isRecording) await addStrokes([compressedStroke]);
        } catch (err) {
            console.error("❌ Failed to save stroke to IndexedDB:", err);
        }

        setCurrentStroke([]);
    }, [currentStroke, isRecording, sessionIdRef, selectedFillColor, currentBoard, dispatch]);

    /* ── startDrawing ───────────────────────────────────────────────────────── */
    const startDrawing = useCallback((rawPos: Position) => {
        if (!isRecording || pauseTime) return;

        const pos = clampToBoard(rawPos, boardW, boardH);

        isDrawing.current = true;
        shapeStartPos.current = pos;
        strokeTimesRef.current.start = timer.timerDisplay;

        switch (actions) {
            case ACTIONS.PEN:
                setCurrentStroke([pos.x, pos.y]);
                break;
            case ACTIONS.ERASER:
                setCurrentStroke([pos.x, pos.y]);
                break;
            case ACTIONS.RECTANGLE: {
                const id = crypto.randomUUID();
                activeShapeId.current = id;
                setRectangles(prev => [...prev, {
                    id, x: pos.x, y: pos.y,
                    width: 0, height: 0,
                    fillColor: selectedFillColor || "transparent",
                }]);
                break;
            }
            case ACTIONS.CIRCLE: {
                const id = crypto.randomUUID();
                activeShapeId.current = id;
                setCircles(prev => [...prev, {
                    id, x: pos.x, y: pos.y,
                    radius: 0,
                    fillColor: selectedFillColor || "transparent",
                }]);
                break;
            }
            case ACTIONS.TRIANGLE: {
                const id = crypto.randomUUID();
                activeShapeId.current = id;
                setTriangles(prev => [...prev, {
                    id, x: pos.x, y: pos.y,
                    size: 0,
                    fillColor: selectedFillColor || "#000",
                    stroke: selectedFillColor || "#ffffff",
                    strokeWidth: 2,
                }]);
                break;
            }
            case ACTIONS.ARROW: {
                const id = crypto.randomUUID();
                activeShapeId.current = id;
                setArrows(prev => [...prev, {
                    id,
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: strokeColor,
                    fillColor: selectedFillColor || "transparent",
                }]);
                break;
            }
            case ACTIONS.LINE: {
                const id = crypto.randomUUID();
                activeShapeId.current = id;
                setStraightLines(prev => [...prev, {
                    id,
                    points: [pos.x, pos.y, pos.x, pos.y],
                    stroke: selectedFillColor || "#000",
                    strokeWidth: 3,
                    fillColor: selectedFillColor || "#000",
                }]);
                break;
            }
        }
    }, [isRecording, pauseTime, boardW, boardH, actions, selectedFillColor, timer.timerDisplay]);

    /* ── updateDrawing ──────────────────────────────────────────────────────── */
    const updateDrawing = useCallback((rawPos: Position) => {
        if (!isRecording || pauseTime) return;
        if (!isDrawing.current || !shapeStartPos.current) return;

        const pos = clampToBoard(rawPos, boardW, boardH);
        const start = shapeStartPos.current;

        switch (actions) {
            case ACTIONS.PEN:
            case ACTIONS.ERASER:
                setCurrentStroke(prev => [...prev, pos.x, pos.y]);
                break;

            case ACTIONS.RECTANGLE: {
                const x = Math.max(0, Math.min(pos.x, start.x));
                const y = Math.max(0, Math.min(pos.y, start.y));
                const maxX = Math.min(Math.max(pos.x, start.x), boardW);
                const maxY = Math.min(Math.max(pos.y, start.y), boardH);
                setRectangles(prev => prev.map(r =>
                    r.id === activeShapeId.current
                        ? { ...r, x, y, width: maxX - x, height: maxY - y }
                        : r
                ));
                break;
            }

            case ACTIONS.CIRCLE: {
                const rawRadius = Math.hypot(pos.x - start.x, pos.y - start.y) / 2;
                const cx = (pos.x + start.x) / 2;
                const cy = (pos.y + start.y) / 2;
                const maxRadius = Math.min(rawRadius, cx, boardW - cx, cy, boardH - cy);
                setCircles(prev => prev.map(c =>
                    c.id === activeShapeId.current
                        ? { ...c, x: cx, y: cy, radius: Math.max(0, maxRadius) }
                        : c
                ));
                break;
            }

            case ACTIONS.TRIANGLE: {
                const rawSize = Math.hypot(pos.x - start.x, pos.y - start.y);
                const maxSize = Math.min(rawSize, start.x, boardW - start.x, start.y, boardH - start.y);
                setTriangles(prev => prev.map(t =>
                    t.id === activeShapeId.current
                        ? { ...t, size: Math.max(0, maxSize) }
                        : t
                ));
                break;
            }

            case ACTIONS.ARROW:
                setArrows(prev => prev.map(a =>
                    a.id === activeShapeId.current
                        ? { ...a, points: [start.x, start.y, pos.x, pos.y] }
                        : a
                ));
                break;

            case ACTIONS.LINE:
                setStraightLines(prev => prev.map(l =>
                    l.id === activeShapeId.current
                        ? { ...l, points: [start.x, start.y, pos.x, pos.y] }
                        : l
                ));
                break;
        }
    }, [isRecording, pauseTime, boardW, boardH, actions]);

    /* ── finishDrawing ──────────────────────────────────────────────────────── */
    const finishDrawing = useCallback(async () => {
        if (!isRecording || pauseTime) return;
        if (!isDrawing.current) return;
        isDrawing.current = false;
        strokeTimesRef.current.end = timer.timerDisplay;

        switch (actions) {
            case ACTIONS.PEN:
                await penDownEvent(null, "stroke");
                break;
            case ACTIONS.ERASER:
                await penDownEvent(null, "eraser");
                break;
            case ACTIONS.RECTANGLE: {
                const shape = rectangles.find(r => r.id === activeShapeId.current);
                if (shape) await shapeDownEvent({ ...shape, type: "rectangle" });
                break;
            }
            case ACTIONS.CIRCLE: {
                const shape = circles.find(c => c.id === activeShapeId.current);
                if (shape) await shapeDownEvent({ ...shape, type: "circle" });
                break;
            }
            case ACTIONS.TRIANGLE: {
                const shape = triangles.find(t => t.id === activeShapeId.current);
                if (shape) await shapeDownEvent({ ...shape, type: "triangle" });
                break;
            }
            case ACTIONS.ARROW: {
                const shape = arrows.find(a => a.id === activeShapeId.current);
                if (shape) await shapeDownEvent({ ...shape, type: "arrow" });
                break;
            }
            case ACTIONS.LINE: {
                const shape = straightLines.find(l => l.id === activeShapeId.current);
                if (shape) await shapeDownEvent({ ...shape, type: "line" });
                break;
            }
        }

        activeShapeId.current = null;
        shapeStartPos.current = null;
    }, [isRecording, pauseTime, actions, rectangles, circles, triangles, arrows, straightLines, penDownEvent, shapeDownEvent, timer.timerDisplay]);

    /* ── Event handlers ─────────────────────────────────────────────────────── */
    const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
        const pos = e.target.getStage()?.getPointerPosition();
        if (pos) startDrawing(pos);
    }, [startDrawing]);

    const handleMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
        const pos = e.target.getStage()?.getPointerPosition();
        if (pos) updateDrawing(pos);
    }, [updateDrawing]);

    const handleMouseUp = useCallback(() => finishDrawing(), [finishDrawing]);

    const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
        e.evt.preventDefault();
        const pos = e.target.getStage()?.getPointerPosition();
        if (pos) startDrawing(pos);
    }, [startDrawing]);

    const handleTouchMove = useCallback((e: KonvaEventObject<TouchEvent>) => {
        e.evt.preventDefault();
        const pos = e.target.getStage()?.getPointerPosition();
        if (pos) updateDrawing(pos);
    }, [updateDrawing]);

    const handleTouchEnd = useCallback((e: KonvaEventObject<TouchEvent>) => {
        e.evt.preventDefault();
        finishDrawing();
    }, [finishDrawing]);

    const onClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
        if (actions !== ACTIONS.SELECT) return;
        if (trRef.current) trRef.current.nodes([e.target]);
    }, [actions]);

    const onDblClick = useCallback((e: KonvaEventObject<MouseEvent>) => {
        dispatch(onSetAction(ACTIONS.SELECT));
        onClick(e);
    }, [dispatch, onClick]);

    /* ✅ FIX 3: Pre-compute dragBoundFuncs per rectangle/circle/triangle
       using useMemo so they don't recreate on every render */
    const rectBoundFuncs = useMemo(() =>
        Object.fromEntries(
            rectangles.map(r => [
                r.id,
                makeDragBoundFunc(r.width, r.height, boardW, boardH),
            ])
        ),
        [rectangles, boardW, boardH]
    );

    const circleBoundFuncs = useMemo(() =>
        Object.fromEntries(
            circles.map(c => [
                c.id,
                (pos: Position) => ({
                    x: Math.max(c.radius, Math.min(pos.x, boardW - c.radius)),
                    y: Math.max(c.radius, Math.min(pos.y, boardH - c.radius)),
                }),
            ])
        ),
        [circles, boardW, boardH]
    );

    const triangleBoundFuncs = useMemo(() =>
        Object.fromEntries(
            triangles.map(t => [
                t.id,
                (pos: Position) => ({
                    x: Math.max(t.size, Math.min(pos.x, boardW - t.size)),
                    y: Math.max(t.size, Math.min(pos.y, boardH - t.size)),
                }),
            ])
        ),
        [triangles, boardW, boardH]
    );

    const transformerBoundBox = useCallback((oldBox: Box, newBox: Box) => {
        if (
            newBox.x < 0 ||
            newBox.y < 0 ||
            newBox.x + newBox.width > boardW ||
            newBox.y + newBox.height > boardH
        ) {
            return oldBox;
        }
        return newBox;
    }, [boardW, boardH]);

    return (
        <div className="h-[90vh] max-h-[94vh] flex overflow-y-auto">
            <div className="">
                <ClassMenu />
            </div>

            <div
                ref={parentRef}
                className="flex-1 stage h-full border-x-2 border-[#3A3A3A80] relative overflow-hidden"
            >
                <Stage
                    width={boardW}
                    height={boardH}
                    style={{ cursor: getCursor(actions ?? "") }}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <Layer>
                        <Rect
                            x={0}
                            y={0}
                            width={boardW}
                            height={boardH}
                            fill="#ffffff"
                            onClick={() => trRef.current && trRef.current.nodes([])}
                        />

                        {strokes.map((s) => (
                            <Line
                                key={s.id}
                                points={s.points}
                                stroke={s.color}
                                strokeWidth={s.type === "eraser" ? 30 : 5}
                                lineCap="round"
                                lineJoin="round"
                                tension={0.5}
                                opacity={0.9}
                                draggable={isDraggable}
                                onClick={onClick}
                                globalCompositeOperation={
                                    s.type === "eraser" ? "destination-out" : "source-over"
                                }
                                dragBoundFunc={boardClamp}
                            />
                        ))}

                        {currentStroke.length > 0 && (
                            <Line
                                points={currentStroke}
                                stroke={actions === ACTIONS.ERASER ? "#fff" : selectedFillColor || "#df4b26"}
                                strokeWidth={actions === ACTIONS.ERASER ? 30 : 5}
                                lineCap="round"
                                lineJoin="round"
                                opacity={1}
                                tension={0.5}
                                globalCompositeOperation={
                                    actions === ACTIONS.ERASER ? "destination-out" : "source-over"
                                }
                            />
                        )}

                        {rectangles.map((rectangle) => (
                            <Rect
                                key={rectangle.id}
                                x={rectangle.x}
                                y={rectangle.y}
                                height={rectangle.height}
                                width={rectangle.width}
                                fill={rectangle.fillColor}
                                stroke={strokeColor}
                                strokeWidth={2}
                                draggable={isDraggable}
                                onClick={onClick}
                                onDblClick={onDblClick}
                                // ✅ FIX 3: Use precomputed function from memo
                                dragBoundFunc={rectBoundFuncs[rectangle.id]}
                                onDragEnd={(e) => {
                                    const node = e.target;
                                    const clamped = clampRect(
                                        { ...rectangle, x: node.x(), y: node.y() },
                                        boardW,
                                        boardH
                                    );
                                    node.position({ x: clamped.x, y: clamped.y });
                                    setRectangles(prev =>
                                        prev.map(r => r.id === rectangle.id ? { ...r, x: clamped.x, y: clamped.y } : r)
                                    );
                                }}
                            />
                        ))}

                        {circles.map((circle) => (
                            <Circle
                                key={circle.id}
                                x={circle.x}
                                y={circle.y}
                                radius={circle.radius}
                                fill={circle.fillColor}
                                stroke={strokeColor}
                                strokeWidth={2}
                                draggable={isDraggable}
                                onClick={onClick}
                                onDblClick={onDblClick}
                                // ✅ FIX 3: Use precomputed function from memo
                                dragBoundFunc={circleBoundFuncs[circle.id]}
                                onDragEnd={(e) => {
                                    const node = e.target;
                                    const clamped = clampCircle(
                                        { ...circle, x: node.x(), y: node.y() },
                                        boardW,
                                        boardH
                                    );
                                    node.position({ x: clamped.x, y: clamped.y });
                                    setCircles(prev =>
                                        prev.map(c => c.id === circle.id ? { ...c, x: clamped.x, y: clamped.y } : c)
                                    );
                                }}
                            />
                        ))}

                        {triangles.map((triangle) => (
                            <RegularPolygon
                                key={triangle.id}
                                id={triangle.id}
                                x={triangle.x}
                                y={triangle.y}
                                sides={3}
                                radius={triangle.size}
                                fill={triangle.fillColor}
                                stroke={strokeColor}
                                strokeWidth={2}
                                draggable={isDraggable}
                                onClick={onClick}
                                onDblClick={onDblClick}
                                // ✅ FIX 3: Use precomputed function from memo
                                dragBoundFunc={triangleBoundFuncs[triangle.id]}
                                onDragEnd={(e) => {
                                    const node = e.target;
                                    const clamped = clampTriangle(
                                        { ...triangle, x: node.x(), y: node.y() },
                                        boardW,
                                        boardH
                                    );
                                    node.position({ x: clamped.x, y: clamped.y });
                                    setTriangles(prev =>
                                        prev.map(t => t.id === triangle.id ? { ...t, x: clamped.x, y: clamped.y } : t)
                                    );
                                }}
                            />
                        ))}

                        {arrows.map((arrow) => (
                            <Arrow
                                key={arrow.id}
                                points={arrow.points}
                                stroke={arrow.stroke}
                                strokeWidth={2}
                                fill={arrow.fillColor}
                                draggable={isDraggable}
                                onClick={onClick}
                                onDblClick={onDblClick}
                                dragBoundFunc={boardClamp}
                            />
                        ))}

                        {straightLines.map((line) => (
                            <Line
                                key={line.id}
                                id={line.id}
                                points={line.points}
                                stroke={line.stroke}
                                strokeWidth={line.strokeWidth || 3}
                                lineCap="round"
                                lineJoin="round"
                                draggable={isDraggable}
                                onClick={onClick}
                                onDblClick={onDblClick}
                                dragBoundFunc={boardClamp}
                            />
                        ))}


                        {selectedImage && vaderImage && (
                            <KonvaImage
                                image={vaderImage}
                                x={boardW - 200}
                                y={20}
                                width={200}
                                height={200}
                                draggable={isDraggable}
                                onClick={onClick}
                            />
                        )}


                        <Transformer
                            ref={trRef}
                            rotateEnabled={false}
                            enabledAnchors={[
                                "top-left", "top-right",
                                "bottom-left", "bottom-right",
                                "top-center", "bottom-center",
                                "middle-left", "middle-right",
                            ]}
                            borderStroke="#2563EB"
                            borderStrokeWidth={1.5}
                            borderDash={[6, 4]}
                            anchorFill="#FFFFFF"
                            anchorStroke="#2563EB"
                            anchorStrokeWidth={1.5}
                            anchorSize={8}
                            anchorCornerRadius={4}
                            padding={6}
                            boundBoxFunc={transformerBoundBox}
                        />
                    </Layer>
                </Stage>

                <div className="absolute bottom-5 w-full flex justify-center">
                    <ClassBottom />
                </div>
            </div>
        </div>
    );
};

export default Class;