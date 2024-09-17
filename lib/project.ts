import type { PluginConfig } from "./types";
import fs from "fs"
import path from "path";

export const createProject = async (config: PluginConfig) => {
    const projectPath = path.resolve(String(config.pluginPath));

    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }

    await fs.cp("./template", projectPath, { recursive: true }, (error) => {
        if (error) {
            throw error;
        }
    });

    await new Promise((resolve) => setTimeout(resolve, 3000));
}