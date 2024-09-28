__kernel void colorTransitionKernel(__write_only image2d_t outImage, float time) {
    // Get the global ID for x and y
    int2 gid = (int2)(get_global_id(0), get_global_id(1));

    // Calculate intensity using sin(time)
    float intensity = 0.5f + 0.5f * sin(time);

    // Create the color between black and white
    float4 color = (float4)(intensity, intensity, intensity, 1.0f);

    // Write the color to the image
    write_imagef(outImage, gid, color);
}