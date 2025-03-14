<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { vertShaderCode, fragShaderCode } from "./cloud-shaders";

    interface Props { disabled?: boolean; }
    const { disabled = $bindable(false) }: Props = $props();

    let adapter: GPUAdapter;
    let device: GPUDevice;

    let canvas: HTMLCanvasElement;
    let ctx: GPUCanvasContext;

    let format: GPUTextureFormat;

    let pipeline: GPURenderPipeline;

    let texture: GPUTexture;

    let vertBuffer: GPUBuffer;
    let timeBuffer: GPUBuffer;
    
    let bindGroup: GPUBindGroup;

    async function start() {
        if (!("gpu" in navigator)) throw new Error("WebGPU API is not supported on this browser.");

        const tmpAdapter = await navigator.gpu.requestAdapter();
        if (!tmpAdapter) throw new Error("Unable to request a valid GPU adapter.");

        const tmpCtx = canvas.getContext("webgpu");
        if (!tmpCtx) throw new Error("Unable to retrieve a GPU context from the canvas.");

        adapter = tmpAdapter;
        device = await adapter.requestDevice({ label: "Default GPU Device" });

        ctx = tmpCtx;

        format = navigator.gpu.getPreferredCanvasFormat();

        const vertShaderModule = device.createShaderModule({
            label: "Vertex Shader",
            code: vertShaderCode
        });

        const fragShaderModule = device.createShaderModule({
            label: "Fragment Shader",
            code: fragShaderCode
        });

        pipeline = device.createRenderPipeline({
            label: "Default GPU Pipeline",
            layout: "auto",

            vertex: {
                module: vertShaderModule,
                buffers: [{
                    arrayStride: 4 * 4,
                    attributes: [
                        { shaderLocation: 0, format: "float32x2", offset: 0 },
                        { shaderLocation: 1, format: "float32x2", offset: 8 }
                    ]
                }]
            },

            fragment: {
                module: fragShaderModule,
                targets: [{ format }]
            },

            primitive: { topology: "triangle-strip" }
        });

        vertBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
        });

        let textureWidth: number = -1;
        let textureHeight: number = -1;

        const textureData = await new Promise<Uint8Array>((resolve, reject) => {
            const image = new Image();
            image.src = "/static/assets/misc/clouds-texture.png";
            
            image.addEventListener("load", () => {
                ({ naturalWidth: textureWidth, naturalHeight: textureHeight } = image);

                const canvas = new OffscreenCanvas(textureWidth, textureHeight);
                const ctx = canvas.getContext("2d")!;

                ctx.drawImage(image, 0, 0);
                resolve(new Uint8Array(ctx.getImageData(0, 0, textureWidth, textureHeight).data));
            });

            image.addEventListener("error", ({ message }) => reject(`Unable to retrieve image because of: ${message}`));
        });

        texture = device.createTexture({
            label: "Clouds Texture",

            size: [textureWidth, textureHeight, 1],
            dimension: "2d",

            format: "rgba8unorm",
            usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT
        });

        device.queue.writeTexture({ texture }, textureData, { bytesPerRow: textureWidth * 4 }, [textureWidth, textureHeight, 1]);

        const sampler = device.createSampler({
            label: "Clouds Texture Sampler",

            addressModeU: "repeat",
            addressModeV: "repeat",

            magFilter: "linear",
            minFilter: "linear"
        });

        timeBuffer = device.createBuffer({
            size: 4,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        bindGroup = device.createBindGroup({
            label: "Fragment Bind Group",
            layout: pipeline.getBindGroupLayout(0),

            entries: [
                { binding: 0, resource: texture.createView() },
                { binding: 1, resource: sampler },
                { binding: 2, resource: { buffer: timeBuffer } }
            ]
        });

        resizer.observe(canvas);
    }

    let frameId: number;
    function render(time: number) {
        const { width, height } = canvas;

        if (disabled || !width || !height) {
            frameId = requestAnimationFrame(render);
            return;
        }

        device.queue.writeBuffer(timeBuffer, 0, new Float32Array([time / 1000]));
        const view = ctx.getCurrentTexture().createView();

        const commandEncoder = device.createCommandEncoder({ label: "Default GPU Command Encoder" });
        const renderPass = commandEncoder.beginRenderPass({
            label: "Default GPU Render Pass",

            colorAttachments: [{
                view,

                clearValue: {
                    r: 0.0,
                    g: 0.0,
                    b: 0.0,
                    a: 0.0
                },

                loadOp: "clear",
                storeOp: "store"
            }]
        });

        renderPass.setPipeline(pipeline);
        renderPass.setVertexBuffer(0, vertBuffer);
        renderPass.setBindGroup(0, bindGroup);
        renderPass.draw(4);
        renderPass.end();

        device.queue.submit([commandEncoder.finish()]);
        frameId = requestAnimationFrame(render);
    }

    const resizer = new ResizeObserver(([canvasEntry]) => {
        frameId && cancelAnimationFrame(frameId);
        frameId = 0;

        const dpr = window.devicePixelRatio;
        const [{
            inlineSize: cssWidth,
            blockSize: cssHeight
        }] = canvasEntry.contentBoxSize;

        const width = cssWidth * dpr;
        const height = cssHeight * dpr;

        canvas.width = width;
        canvas.height = height;

        const aspectRatio = height / width;

        const vertices = new Float32Array([
                             -1.0, -1.0,   0.0, 1.0,
            aspectRatio * 2 - 1.0, -1.0,   1.0, 1.0,
                             -1.0,  1.0,   0.0, 0.0,
            aspectRatio * 2 - 1.0,  1.0,   1.0, 0.0
        ]);

        !disabled && width && height && ctx.configure({ device, format, alphaMode: "premultiplied" });

        device.queue.writeBuffer(vertBuffer, 0, vertices);
        render(0);
    });

    onMount(start);
    onDestroy(() => {
        resizer.disconnect();

        texture?.destroy();

        vertBuffer?.destroy();
        timeBuffer?.destroy();
    });
</script>

<canvas bind:this={canvas} class="{disabled ? "hidden" : ""} absolute top-0 left-160 w-60 h-full min-h-1 pointer-events-none touch-none"></canvas>