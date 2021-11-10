import shaders from "./shaders";
import geometry from "./geometry";
import { getMetapillHandle, getMetaballsHandle } from "./uniforms";
import { getUniformLocation } from "./utils";

export type Options = {
  numMetaballs: number;
  color: [number, number, number];
  colorB: [number, number, number];
  radius: number;
};

export type Metaball = {
  x: number;
  y: number;
  /**
   * Radius
   */
  r: number;
};

export type Metapill = {
  r: number;
  ax: number;
  ay: number;
  bx: number;
  by: number;
};

type Props = {
  canvas: HTMLCanvasElement,
  metaballs: Metaball[],
  metapill: Metapill,
  color: [number, number, number],
  colorB: [number, number, number]
}

export default function initMetaballs({
  canvas,
  metaballs,
  metapill,
  color,
  colorB
}: Props) {
  /**
   * Shaders setup
   */
  const gl = canvas.getContext("webgl");

  if (gl === null) {
    console.log("28", gl);
    return;
  }
  // anti aliasing
  gl.enable(gl.SAMPLE_COVERAGE);
  gl.sampleCoverage(1, false);

  const options: Options = {
    numMetaballs: metaballs.length,
    radius: 8,
    color,
    colorB,
  };
  const { vertexShader, fragmentShader } = shaders({ gl, options });

  const program = gl.createProgram();
  if (
    program === null ||
    vertexShader === undefined ||
    fragmentShader === undefined
  ) {
    console.log("46", program, vertexShader, fragmentShader);
    return;
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  gl.useProgram(program);

  /**
   * Canvas & Metaballs setup
   */
  geometry({ gl, program });

  // resize handler
  const resize = () => {
    const dppx = window.devicePixelRatio;
    
    // Lookup the size the browser is displaying the canvas in CSS pixels
    // and compute a size needed to make our drawingbuffer match it in
    // device pixels.
    const displayWidth = Math.floor(gl.canvas.width * dppx);
    const displayHeight = Math.floor(gl.canvas.height * dppx);

    // Check if the canvas is not the same size.
    if (
      (gl.canvas.width !== displayWidth ||
      gl.canvas.height !== displayHeight)
    ) {
      // Make the canvas the same size
      gl.canvas.width = displayWidth;
      gl.canvas.height = displayHeight;
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    }
  };

  // user might now have set correct canvasWidth / canvasHeight
  resize();

  const metaballsHandle = getMetaballsHandle({ gl, program });
  const metapillHandle = getMetapillHandle({ gl, program });
  // get windowSize uniform
  const windowSizeHandle = getUniformLocation({
    gl,
    program,
    name: "windowSize",
  });

  /**
   * Simulation step, data transfer, and drawing
   */
  const step = function () {
    const canvasWidth = gl.canvas.width;
    const canvasHeight = gl.canvas.height;

    // To send the data to the GPU,
    // flatten the data into a single array.
    const dataToSendToGPU = new Float32Array(3 * metaballs.length);
    metaballs.forEach((mb, i) => {
      const baseIndex = 3 * i;
      dataToSendToGPU[baseIndex + 0] = mb.x;
      dataToSendToGPU[baseIndex + 1] = mb.y;
      dataToSendToGPU[baseIndex + 2] = mb.r;
    });

    gl.clearColor(0, 0, 0, 0);
    gl.uniform3fv(metaballsHandle, dataToSendToGPU);

    const data2 = new Float32Array(3 * 2);
    data2[0] = metapill.ax;
    data2[1] = metapill.ay;
    data2[2] = metapill.r;
    data2[3] = metapill.bx;
    data2[4] = metapill.by;
    data2[5] = metapill.r;
    gl.uniform3fv(metapillHandle, data2);

    const data = Float32Array.from({ length: 2 }, (_, index) =>
      index === 0 ? canvasWidth : canvasHeight
    );
    gl.uniform2fv(windowSizeHandle, data);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  return step;
}
