#include <metal_stdlib>
using namespace metal;

kernel void colorTransitionKernel(texture2d<float, access::write> outTexture [[texture(0)]],
                                  constant float &time [[buffer(0)]],
                                  uint2 gid [[thread_position_in_grid]]) {
    // Get the texture size
    uint width = outTexture.get_width();
    uint height = outTexture.get_height();

    // Check if the thread is within the texture bounds
    if (gid.x >= width || gid.y >= height) return;

    // Calculate intensity using sin(time)
    float intensity = 0.5 + 0.5 * sin(time);

    // Create color between black and white based on intensity
    float4 color = float4(float3(intensity), 1.0);

    // Write the color to the texture
    outTexture.write(color, gid);
}