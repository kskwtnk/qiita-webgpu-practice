struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) textureCoord: vec2f,
}

@vertex
fn vertexMain(@location(0) position: vec2f) -> VertexOutput {
  var output: VertexOutput;
  output.position = vec4f(position, 0.0, 1.0);
  // 座標を [-1, 1] から [0, 1] に正規化
  output.textureCoord = position * 0.5 + 0.5;
  return output;
}
