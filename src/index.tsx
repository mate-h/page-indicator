import effect from "./canvas";
import { useEffect, useRef } from "preact/hooks";
import { h2r } from "./util";

type Props = {
  color: string;
  colorB: string;
  width: number;
  height: number;
  /** Minimum 1 page */
  pageCount: number;
};

export function PageIndicator({
  color = "#007aff",
  colorB = "#e3f3ff",
  width = 320,
  height = 16,
  pageCount = 1,
}: Partial<Props>) {
  const node = useRef<HTMLCanvasElement>(null);
  let canvasEffect = useRef<ReturnType<typeof effect>>(null);
  useEffect(() => {
    if (canvasEffect.current === null && node.current) {
      canvasEffect.current = effect({
        color: h2r(color)!,
        colorB: h2r(colorB)!,
        canvas: node.current,
        pageCount: Math.max(pageCount, 1),
      });
    }
  }, [color, colorB]);
  return (
    <canvas
      class="mx-auto block user-select-none"
      ref={node}
      width={width}
      height={height}
    />
  );
}
