export function getUniformLocation({ gl, program, name }: {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  name: string;
}) {
  const uniformLocation = gl.getUniformLocation(program, name)
  if (uniformLocation === -1) {
    throw new Error(`Can not find uniform ${name}.`)
  }
  return uniformLocation
}