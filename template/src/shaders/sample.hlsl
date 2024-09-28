RWTexture2D<float4> outTexture : register(u0);
cbuffer TimeBuffer : register(b0) {
    float time;
}

[numthreads(16, 16, 1)]
void main(uint3 gid : SV_DispatchThreadID) {
    // Get the texture size (you can pass this as a uniform if necessary)
    uint width, height;
    outTexture.GetDimensions(width, height);

    // Check if within texture bounds
    if (gid.x >= width || gid.y >= height) return;

    // Calculate intensity using sin(time)
    float intensity = 0.5 + 0.5 * sin(time);

    // Write the black to white color based on intensity
    outTexture[gid.xy] = float4(intensity, intensity, intensity, 1.0);
}