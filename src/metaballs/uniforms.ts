import { getUniformLocation } from "./utils";

const getMetaballsHandle = ({
  gl,
  program,
}: {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
}) => {
  const metaballsHandle = getUniformLocation({
    gl,
    program,
    name: "metaballs",
  });
  return metaballsHandle;
};

const getMetapillHandle = ({
  gl,
  program,
}: {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
}) => {
  const metapillHandle = getUniformLocation({
    gl,
    program,
    name: "metapill",
  });
  return metapillHandle;
};

export { getMetapillHandle, getMetaballsHandle };
