import './style.css';

async function initWebGPU() {
  // Canvas要素の取得
  const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;

  // GPUアダプターとデバイスの取得
  const adapter = await navigator.gpu.requestAdapter() as GPUAdapter;
  const device = await adapter.requestDevice();

  // Canvasコンテキストの取得と設定
  const context = canvas.getContext('webgpu') as GPUCanvasContext;
  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device: device,
    format: canvasFormat,
  });

  // 頂点データの定義（四角形の4つの頂点）
  const vertices = new Float32Array([
    -0.5, -0.5, // 左下
     0.5, -0.5, // 右下
    -0.5,  0.5, // 左上
     0.5,  0.5, // 右上
  ]);

  // 頂点バッファの作成
  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertices);

  // WGSLシェーダーの定義
  const shaderModule = device.createShaderModule({
    code: `
      @vertex
      fn vertexMain(@location(0) position: vec2f) -> @builtin(position) vec4f {
        return vec4f(position, 0.0, 1.0);
      }

      @fragment
      fn fragmentMain() -> @location(0) vec4f {
        return vec4f(1.0, 0.0, 0.0, 1.0); // 赤色
      }
    `,
  });

  // レンダーパイプラインの構築
  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vertexMain',
      buffers: [
        {
          arrayStride: 8, // 2 floats * 4 bytes
          attributes: [
            {
              shaderLocation: 0,
              offset: 0,
              format: 'float32x2',
            },
          ],
        },
      ],
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fragmentMain',
      targets: [
        {
          format: canvasFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-strip',
    },
  });

  // 描画コマンドの記録と実行
  const encoder = device.createCommandEncoder();
  const textureView = context.getCurrentTexture().createView();
  const renderPass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: textureView,
        loadOp: 'clear',
        clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }, // 黒色
        storeOp: 'store',
      },
    ],
  });
  renderPass.setPipeline(pipeline);
  renderPass.setVertexBuffer(0, vertexBuffer);
  renderPass.draw(4); // 4つの頂点を描画
  renderPass.end();
  device.queue.submit([encoder.finish()]);
}

initWebGPU();
