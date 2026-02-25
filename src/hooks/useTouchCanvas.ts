import { useCallback, useRef } from "react";

interface Point { x: number; y: number; }

interface UseTouchCanvasOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onStart?: (p: Point) => void;
  onMove?: (p: Point) => void;
  onEnd?: (p: Point) => void;
}

export function useTouchCanvas({ canvasRef, onStart, onMove, onEnd }: UseTouchCanvasOptions) {
  const active = useRef(false);

  const getPos = useCallback((e: React.PointerEvent): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, [canvasRef]);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    active.current = true;
    onStart?.(getPos(e));
  }, [getPos, onStart]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!active.current) return;
    e.preventDefault();
    onMove?.(getPos(e));
  }, [getPos, onMove]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!active.current) return;
    active.current = false;
    onEnd?.(getPos(e));
  }, [getPos, onEnd]);

  return { onPointerDown, onPointerMove, onPointerUp };
}
