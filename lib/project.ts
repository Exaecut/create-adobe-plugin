import type { PluginConfig } from "./types";

export const createProject = async (config: PluginConfig) => {
    console.log(config)
    await new Promise((resolve) => setTimeout(resolve, 3000));
}