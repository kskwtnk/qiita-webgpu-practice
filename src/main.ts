import './style.css';
import vertexShaderCode from './shaders/plane.vert.wgsl?raw';
import fragmentShaderCode from './shaders/plane.frag.wgsl?raw';

async function initWebGPU() {
  // Canvas要素の取得
  const canvas = document.getElementById('webgl-canvas') as HTMLCanvasElement;

  // GPUアダプターとデバイスの取得
  const adapter = await navigator.gpu.requestAdapter() as GPUAdapter;
  const device = await adapter.requestDevice();

  // Canvasコンテキストの取得
  const context = canvas.getContext('webgpu') as GPUCanvasContext;
  const canvasFormat = navigator.gpu.getPreferredCanvasFormat();

  // 頂点データの定義（四角形の4つの頂点）
  const vertices = new Float32Array([
    -1.0, -1.0, // 左下
     1.0, -1.0, // 右下
    -1.0,  1.0, // 左上
     1.0,  1.0, // 右上
  ]);

  // 頂点バッファの作成
  const vertexBuffer = device.createBuffer({
    size: vertices.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertices);

  // WGSLシェーダーの定義（別ファイルから読み込み）
  const shaderModule = device.createShaderModule({
    code: vertexShaderCode + fragmentShaderCode,
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

  // 描画処理
  function render() {
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

  // キャンバスサイズの調整とコンテキスト設定
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    context.configure({
      device: device,
      format: canvasFormat,
    });

    // リサイズ後に再描画
    render();
  }

  // 初期化時とリサイズ時にキャンバスサイズを調整
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

initWebGPU();
