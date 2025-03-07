struct VertIn {
    @location(0) pos: vec2<f32>,
    @location(1) uv: vec2<f32>
}

struct VertOut {
    @builtin(position) pos: vec4<f32>,
    @location(0) uv: vec2<f32>
}

@vertex
fn main(in: VertIn) -> VertOut {
    var out: VertOut;
    out.pos = vec4<f32>(in.pos, 0.0, 1.0);
    out.uv = in.uv;

    return out;
}