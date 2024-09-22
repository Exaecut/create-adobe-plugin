import Handlebars from "handlebars";
import type { PluginConfig } from "./types";
import fs from "fs"
import path from "path";

const compileTemplate = async (filePath: string, data: any) => {
    const source = await fs.promises.readFile(filePath, "utf-8");
    const template = Handlebars.compile(source);
    return template(data);
}

export const createProject = async (config: PluginConfig, callback: (file: string) => void) => {
    const projectPath = path.resolve(String(config.pluginPath));

    if (!fs.existsSync(projectPath)) {
        fs.mkdirSync(projectPath, { recursive: true });
    }

    const templatePath = path.join(import.meta.dir, "template");
    await fs.cp(templatePath, projectPath, { recursive: true }, (error) => {
        if (error) {
            throw error;
        }
    });

    await new Promise((resolve) => setTimeout(resolve, 200));

    const files = fs.readdirSync(projectPath, { recursive: true, encoding: "utf-8" })
        .filter((file) => !fs.lstatSync(path.join(projectPath, file)).isDirectory())
        .filter((file) => {
            const ext = path.extname(file);
            return ext === ".h" || ext === ".cpp" || ext === ".r" || ext === ".strings" || ext === ".plist" || ext === ".md";
        });

    for (const file of files) {
        const filePath = path.join(projectPath, file);

        const data = {
            ...config,
            shortCategory: config.category.split(" ").join("").substring(0, 4).toUpperCase(),
        }

        callback(filePath);

        const compiledFile = await compileTemplate(filePath, data);
        await fs.promises.writeFile(filePath, compiledFile);
    }
}