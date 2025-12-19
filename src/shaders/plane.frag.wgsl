@fragment
fn fragmentMain(@location(0) textureCoord: vec2f) -> @location(0) vec4f {
  let pi = acos(-1.0);

  // パターン1: 水平グラデーション
  // let r = textureCoord.x;
  // let g = 0.0;
  // let b = 0.0;

  // パターン2: 垂直グラデーション
  // let r = textureCoord.y;
  // let g = 0.0;
  // let b = 0.0;

  // パターン3: 斜めグラデーション
  // let r = (textureCoord.x + textureCoord.y) / 2.0;
  // let g = 0.0;
  // let b = 0.0;

  // パターン4: 波のようなパターン
  // let r = abs(sin((textureCoord.x + textureCoord.y) * pi * 3.0));
  // let g = 0.0;
  // let b = 0.0;

  // パターン5: 千鳥格子風
  let r = sin(textureCoord.x * pi * 10.0) * cos(textureCoord.y * pi * 5.0) * 0.5 + 0.5;
  let g = 0.0;
  let b = 0.0;

  return vec4f(r, g, b, 1.0);
}
