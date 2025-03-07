@group(0) @binding(0) var blurCloudsTexture: texture_2d<f32>;
@group(0) @binding(1) var textureSampler: sampler;
@group(0) @binding(2) var<uniform> time: f32;

const scrollSpeed = vec2<f32>(0.1, 0.0);

@fragment
fn main(@location(0) uv: vec2<f32>) -> @location(0) vec4<f32> {
    let offset = fract(time * scrollSpeed);

    let uvColor = textureSample(blurCloudsTexture, textureSampler, uv - offset);
    let brightness = uvColor.r * 1.6 + uv.x * 5.4 - 0.30;

    let rgb = select(mix(0.118, 0.0392, (brightness - 0.96) * 25.0), 0.0196, brightness < 0.96);
    return vec4<f32>(rgb, rgb, rgb, select(0.0, 1.0, brightness < 1.0));
}