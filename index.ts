import { cancel, confirm, group, intro, log, note, outro, spinner, text } from "@clack/prompts";
import { getSDKInstallPath, initGitRepo, setPersistentEnvVar } from "./lib/utils";

import type { PluginConfig } from "./lib/types";
import colors from "picocolors"
import { createProject } from "./lib/project";
import fs from "fs"
import path from "path"

async function main() {
    console.clear();
    intro("Configure your Adobe plugin");

    const pluginConfig: PluginConfig = await group({
        name: () => text({
            message: "What is the name of your plugin?",
            placeholder: "new-adobe-plugin",
            defaultValue: "new-adobe-plugin"
        }),
        pluginPath: ({ results }) => text({
            message: "What is the path of your plugin?",
            placeholder: `./${results.name}`,
            defaultValue: `./${results.name}`
        }),
        category: () => text({
            message: "Under which category your plugin belongs?",
            placeholder: "Type a plugin category",
            defaultValue: "No Category"
        }),
        initializeGit: () => confirm({
            message: "Initialize git repository?",
            initialValue: false,
            active: "Yes",
            inactive: "No"
        }),
    }, {
        onCancel: () => {
            cancel("Cancelled!")
            process.exit(0)
        }
    });

    let originPath = null;
    if (pluginConfig.initializeGit) {
        originPath = await text({
            message: "What is the git repository url?",
            placeholder: "https://github.com/.../repo.git (Can be left empty)",
        })
    }

    note(`Your plugin configuration:
    - Name: ${pluginConfig.name}
    - Path: ${pluginConfig.pluginPath}
    - Category: ${pluginConfig.category}
    - Initialize git: ${pluginConfig.initializeGit ? "Yes" : "No"}
    - Git repo url: ${originPath ? String(originPath) : "Not defined"}`,
        "Summary");

    const confirmation = await confirm({ message: "Do you confirm the plugin configuration?", active: "Yes", inactive: "No", initialValue: true });
    if (!confirmation) {
        cancel("Cancelled!")
        process.exit(0)
    }

    const progress = spinner();

    progress.start("Creating your plugin...");

    const normalizedPath = path.resolve(String(pluginConfig.pluginPath));
    if (!fs.existsSync(normalizedPath)) {
        fs.mkdirSync(normalizedPath, { recursive: true });
    }

    if (pluginConfig.initializeGit) {
        initGitRepo(String(originPath), String(pluginConfig.pluginPath));
    }

    if (setPersistentEnvVar("EX_AFTERFX_SDK", getSDKInstallPath("aftereffects"))) {
        progress.message(`Created environment variable ${colors.bold(`EX_AFTERFX_SDK=${getSDKInstallPath("aftereffects")}`)}`);
    } else {
        log.info(`Environment variable ${colors.bold(`EX_AFTERFX_SDK=${getSDKInstallPath("aftereffects")}`)} already exists`);
    }

    if (setPersistentEnvVar("EX_PREMIERE_SDK", getSDKInstallPath("premiere"))) {
        progress.message(`Created environment variable ${colors.bold(`EX_PREMIERE_SDK=${getSDKInstallPath("premiere")}`)}`);
    } else {
        log.info(`Environment variable ${colors.bold(`EX_PREMIERE_SDK=${getSDKInstallPath("premiere")}`)} already exists`);
    }

    progress.message(`Creating project files...`);

    await createProject(pluginConfig, (file) => {
        progress.message(`Applying template to ${colors.bold(file)}`);
    });

    progress.stop(`${colors.green("✔")} Successfully created your plugin ${colors.blue(pluginConfig.name)} !`);

    note([
        `-- CREATED ENVIRONMENT VARIABLES --`,
        `EX_AFTERFX_SDK=${getSDKInstallPath("aftereffects")}`,
        `EX_PREMIERE_SDK=${getSDKInstallPath("premiere")}`,
        '',
        `-- NEXT STEPS --`,
        `1. cd ${pluginConfig.pluginPath}`,
        `2. code .`,
        `3. make build`,
        colors.yellow(colors.bold("⚠️ IMPORTANT: Manual SDK download is required: https://github.com/exaecut/create-adobe-plugin#manual-sdk-download")),
        `~ by ${colors.bold('Exaecut')}`
    ].join("\n"), "Finished !");

    outro("Got any issues? Please open an issue at https://github.com/exaecut/create-adobe-plugin/issues");
}

await main().catch((error) => log.error(error));