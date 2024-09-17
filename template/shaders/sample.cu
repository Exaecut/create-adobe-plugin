__global__ void colorTransitionKernel(float4* outImage, int width, int height, float time) {
    // Calculate the thread’s x and y position in the grid
    int x = blockIdx.x * blockDim.x + threadIdx.x;
    int y = blockIdx.y * blockDim.y + threadIdx.y;

    // Check if within image bounds
    if (x >= width || y >= height) return;

    // Calculate the pixel index
    int pixelIndex = y * width + x;

    // Calculate intensity using sin(time)
    float intensity = 0.5f + 0.5f * sinf(time);

    // Set the pixel color (black to white transition)
    outImage[pixelIndex] = make_float4(intensity, intensity, intensity, 1.0f);
}