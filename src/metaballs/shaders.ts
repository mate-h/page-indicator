import { Options } from ".";

const colorToVec4 = (color: string) => {
  const isValid = /^#[0-9A-F]{6,8}$/i.test(color);

  if (!isValid) {
    throw new Error(
      `${color} is not a valid hex color. Must be a 6 (8) character hex (+alpha) color.`
    );
  }

  const hexChannels = [
    color.slice(1, 3),
    color.slice(3, 5),
    color.slice(5, 7),
    color.slice(7, 9),
  ];
  const unitChannels = hexChannels
    .map((hex) => Number.parseInt(hex, 16))
    .map((val) => val / 0xff);
  if (!Number.isFinite(unitChannels[3])) unitChannels[3] = 1.0;

  return unitChannels;
};

export default function shaders({
  gl,
  options,
}: {
  gl: WebGLRenderingContext;
  options: Options;
}) {
  // Utility to fail loudly on shader compilation failure
  function compileShader(shaderSource: string, shaderType: number) {
    const shader = gl.createShader(shaderType);
    if (shader === null) return;
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(
        `Shader compile failed with: ${gl.getShaderInfoLog(shader)}`
      );
    }

    return shader;
  }

  const vertexShader = compileShader(
    /*glsl*/ `
attribute vec2 position;
void main() {
    // position specifies only x and y.
    // We set z to be 0.0, and w to be 1.0
    gl_Position = vec4(position, 0.0, 1.0);
}
`,
    gl.VERTEX_SHADER
  );

  const numMetaballs = options.numMetaballs;
  const color = options.color.map(c => c/255);
  const colorB = options.colorB.map(c => c/255);
  const fragmentShader = compileShader(
    /*glsl*/ `
precision highp float;
uniform vec2 windowSize;
uniform vec3 metaballs[${numMetaballs}];
uniform vec3 metapill[2];

struct Point
{
  float x;
  float y;
};

float dist2(Point v, Point w) { 
  return pow(v.x - w.x, 2.0) + pow(v.y - w.y, 2.0);
}
float distToSegmentSquared(Point p, Point v, Point w) {
  float l2 = dist2(v, w);
  if (l2 == 0.0) return dist2(p, v);
  float t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = max(0.0, min(1.0, t));
  return dist2(p, Point(v.x + t * (w.x - v.x), v.y + t * (w.y - v.y)));
}
float distToSegment(Point p, Point v, Point w) { 
  return sqrt(distToSegmentSquared(p, v, w)); 
}

void main(){
    // scaling from [0,100] to [0, canvasWidth/Height]
    float radiusMultiplier = 2.0;
    float xMultiplier = 2.0;
    float yMultiplier = 2.0;
    float x = gl_FragCoord.x;
    float y = windowSize.y - gl_FragCoord.y;
    float v = 0.0;
    for (int i = 0; i < ${numMetaballs}; i++) {
        vec3 mb = metaballs[i];
        float dx = abs((mb.x * xMultiplier) - x);
        float dy = abs((mb.y * yMultiplier) - y);
        
        // wrap-around-the-edges logic
        // dx = min(dx, windowSize.x - dx);
        // dy = min(dy, windowSize.y - dy);
        float r = mb.z;
        float f = 2.0;
        v += pow(r, f)/(pow(dx, f) + pow(dy, f));
    }
    // pill shape
    float v2 = 0.0;
    for (int i = 0; i < 1; i++) {
      vec3 mb1 = metapill[0];
      vec3 mb2 = metapill[1];
      float dist = distToSegmentSquared(Point(x, y), Point(mb1.x * xMultiplier, mb1.y * yMultiplier), Point(mb2.x * xMultiplier, mb2.y * yMultiplier));
      float r = mb1.z * 1.1;
      float f = 2.0;
      v2 += pow(r, f)/dist;
    }

    float v3 = 0.0;
    vec3 mb = metapill[0];
    float dx = abs((mb.x * xMultiplier) - x);
    float dy = abs((mb.y * yMultiplier) - y);
    float r = mb.z * 1.1;
    float f = 2.0;
    v3 += pow(r, f)/(pow(dx, f) + pow(dy, f));
    
    float o = 1.00;
    float p = 28.0;
    float h = pow(v3, 10.0);
    float o1 = min(1.0, h);
    float o2 = 1.0 - o1;
    gl_FragColor = vec4(${color[0].toFixed(20)} * o1, ${color[1].toFixed(20)} * o1, ${color[2].toFixed(20)} * o1, o1);
    if (v + v2 > 1.0) {
      float h = pow(v3, p);
      float o1 = (o + min(1.0, h) * (1.0 - o)) * o2;
      gl_FragColor += vec4(${colorB[0].toFixed(20)} * o1, ${colorB[1].toFixed(20)} * o1, ${colorB[2].toFixed(20)} * o1, o1);
    } else {
      float h = pow(v + v2, p) * o * o2;
      gl_FragColor += vec4(${colorB[0].toFixed(20)} * h, ${colorB[1].toFixed(20)} * h, ${colorB[2].toFixed(20)} * h, h);
    }
}
`,
    gl.FRAGMENT_SHADER
  );

  return {
    vertexShader,
    fragmentShader,
  };
}
