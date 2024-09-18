import Handlebars from "handlebars";
import type { PluginConfig } from "./types";
import fs from "fs"
import path from "path";
import { spinner } from "@clack/prompts";

const compileTemplate = async (filePath: string, data: any) => {
    const source = await fs.promises.readFile(filePath, "utf-8");
    const template = Handlebars.compile(source);
    return template(data);
}

export const createProject = async (config: PluginConfig, progress: ReturnType<typeof spinner>) => {
    const projectPath = path.resolve(String(config.pluginPath));

    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }

    await fs.cp("./template", projectPath, { recursive: true }, (error) => {
        if (error) {
            throw error;
        }
    });

    
    const files = await fs.promises.readdir(projectPath);
    for (const file of files) {
        const filePath = path.join(projectPath, file);
        
        if (fs.lstatSync(filePath).isDirectory()) {
            continue;
        }
        
        const ext = path.extname(filePath);
        if (ext === ".h" || ext === ".cpp" || ext === ".r" || ext === ".strings" || ext === ".plist" || ext === ".md" ) {
            progress.message(`Creating ${path.basename(filePath)}...`);
            const data = {
                ...config,
                shortCategory: config.category.substring(0, 4).toUpperCase(),
            }

            const compiledFile = await compileTemplate(filePath, data);
            await fs.promises.writeFile(filePath, compiledFile);
        }
    }
}