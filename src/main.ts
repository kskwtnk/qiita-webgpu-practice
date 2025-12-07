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
    alphaMode: 'premultiplied',
  });

  // 背景色のクリア
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
  renderPass.end();
  device.queue.submit([encoder.finish()]);
}

initWebGPU();
