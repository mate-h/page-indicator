import initMetaballs, { Metaball, Metapill } from "./metaballs";
import { Animation } from './animation';

export default function({
  canvas,
  pageCount = 3,
  color = [0,0,0],
  colorB = [0,0,0],
  size = 8
}: { 
  canvas: HTMLCanvasElement, 
  pageCount?: number,
  color?: [number, number, number],
  colorB?: [number, number, number],
  size?: number
}) {
  const dppx = window.devicePixelRatio;
  if (canvas.getAttribute("data-scaled") !== "true") {
    canvas.setAttribute("data-scaled", "true");
    canvas.style.width = `${canvas.width}px`;
    canvas.style.height = `${canvas.height}px`;
    canvas.width = canvas.width * dppx;
    canvas.height = canvas.height * dppx;
  }
  const width = canvas.width;
  const height = canvas.height;
  if (dppx === 1) {
    canvas.style.width = `${canvas.width * 2}px`;
    canvas.style.height = `${canvas.height * 2}px`;
    canvas.width = canvas.width * 2;
    canvas.height = canvas.height * 2;
  }

  const s = size * dppx;
  const w = pageCount * (s + s) - s;
  const metaballs: Metaball[] = [];
  const metapill: Metapill = {
    ax: (width/2 - w/2),
    ay: (height/2),
    bx: (width/2 - w/2),
    by: (height/2),
    r: s
  };
  for (let i = 0; i < pageCount; i++) {
    const dx = i * (s + s);
    metaballs.push({ x: (dx + width/2 - w/2), y: (height/2), r: s });
    // ctx.beginPath();
    // ctx.arc(4 + dx, 4, 4, 0, Math.PI*2, false);
    // ctx.fill();
  }
  const step = initMetaballs({canvas, metaballs, metapill, color, colorB}) || (() => {});
  step();

  const p = 3;
  const pillAnimation = new Animation({ state: 0, duration: 400, timing: {
    t: x => 1 - Math.pow(1 - x, p),
    tinv: x => 1 - Math.pow(1 - x, 1/p),
  } });
  pillAnimation.listen(v => {
    const dx = v * (s + s);
    metapill.ax = ((width/2 - w/2) + dx);
    step();
  })

  /** Scroll callback, number between 0 - pageCount */
  function scroll(n: number) {
    metapill.bx = (n * (s + s) + (width/2 - w/2));
    step();
  }
  let prevPage = 0;
  let currentPage = 0;
  /** Set current page */
  function set(n: number) {
    prevPage = currentPage;
    currentPage = n;
    pillAnimation.set(n);
  }
  return { scroll, set }
}