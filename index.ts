import { appendToSystemPath, getExaecutDataPath, getSDKInstallPath, initGitRepo, setPersistentEnvVar } from "./lib/utils";
import { confirm, input } from '@inquirer/prompts';

import type { PluginConfig } from "./lib/types";
import colors from "picocolors";
import { createProject } from "./lib/project";
import fs from "fs";
import ora from "ora";
import path from "path";

async function main() {
    console.clear();
    console.log("Configure your Adobe plugin");

    let pluginConfig: Partial<PluginConfig> = {};
    pluginConfig.name = await input({
        message: "What is the name of your plugin?",
        default: "new-adobe-plugin",
        required: true,
        validate: (value: string) => {
            if (value.length > 0 && value.length < 50 && !value.includes(" ") && !value.includes("/") && !value.includes("\\") && !value.includes(":") && !value.includes("*") && !value.includes("?") && !value.includes("\"") && !value.includes("<") && !value.includes(">") && !value.includes("|")) {
                return true;
            } else {
                return "Please provide a valid name";
            }
        }
    });

    pluginConfig.pluginPath = await input({
        message: "What is the path of your plugin?",
        default: `./${pluginConfig.name}`,
        required: true,
        validate: (value: string) => {
            if (!fs.existsSync(path.resolve(String(value)))) {
                return true;
            } else {
                return "Path already exists";
            }
        }
    })

    pluginConfig = {
        ...pluginConfig,
        category: await input({
            message: "Under which category does your plugin belong?",
            default: "No Category",
            required: true
        }),
        initializeGit: await confirm({
            message: "Initialize git repository?",
            default: false
        }),
    };

    let originPath = null;
    if (pluginConfig.initializeGit) {
        originPath = await input({
            message: "What is the git repository URL?",
            default: "",
            required: false,
            validate: (value: string) => {
                if (value.startsWith("http") || value.startsWith("git") || value === "") {
                    return true;
                }
                return "Please provide a valid git repository URL";
            }
        });
    }

    console.log(colors.bold("Your plugin configuration:"));
    console.log(`- Name: ${pluginConfig.name}`);
    console.log(`- Path: ${pluginConfig.pluginPath}`);
    console.log(`- Category: ${pluginConfig.category}`);
    console.log(`- Initialize git: ${pluginConfig.initializeGit ? "Yes" : "No"}`);
    console.log(`- Git repo URL: ${originPath ? originPath : "Not defined"}`);

    const confirmation = await confirm({
        message: "Do you confirm the plugin configuration?",
        default: true
    });

    if (!confirmation) {
        console.log(colors.red("Cancelled!"));
        process.exit(0);
    }

    const spinner = ora({ color: "yellow", text: 'Creating your plugin...' }).start();
    await new Promise((resolve) => setTimeout(resolve, 2000));

    try {
        const normalizedPath = path.resolve(String(pluginConfig.pluginPath));
        if (!fs.existsSync(normalizedPath)) {
            fs.mkdirSync(normalizedPath, { recursive: true });
        }

        if (pluginConfig.initializeGit) {
            initGitRepo(originPath, String(pluginConfig.pluginPath));
        }

        if (setPersistentEnvVar("EX_AFTERFX_SDK", getSDKInstallPath("aftereffects"))) {
            spinner.text = `Created environment variable ${colors.bold(`EX_AFTERFX_SDK=${getSDKInstallPath("aftereffects")}`)}`;
        }

        if (setPersistentEnvVar("EX_PREMIERE_SDK", getSDKInstallPath("premiere"))) {
            spinner.text = `Created environment variable ${colors.bold(`EX_PREMIERE_SDK=${getSDKInstallPath("premiere")}`)}`;
        }

        if (setPersistentEnvVar("EXAECUT_TOOLS", getExaecutDataPath("tools"))) {
            spinner.text = `Created environment variable ${colors.bold(`EXAECUT_TOOLS=${getExaecutDataPath("tools")}`)}`;
        }

        appendToSystemPath(getExaecutDataPath("tools"));

        spinner.text = `Creating project files...`;

        await createProject(pluginConfig, (file: string) => {
            spinner.text = `Applying template to ${colors.bold(file)}`;
        });

        spinner.succeed(`${colors.green("✔")} Successfully created your plugin ${colors.blue(pluginConfig.name)}!`);

        console.log([
            `-- CREATED ENVIRONMENT VARIABLES --`,
            `EX_AFTERFX_SDK=${getSDKInstallPath("aftereffects")}`,
            `EX_PREMIERE_SDK=${getSDKInstallPath("premiere")}`,
            `EXAECUT_TOOLS=${getExaecutDataPath("tools")}`,
            '',
            `-- NEXT STEPS --`,
            `1. cd ${pluginConfig.pluginPath}`,
            `2. code .`,
            `3. xmake`,
            "",
            `-- DEBUG YOUR PLUGIN --`,
            `1. xmake run -d plugin`,
            "",
            colors.yellow(colors.bold("⚠️ IMPORTANT: Manual SDK download is required: https://github.com/exaecut/create-adobe-plugin#manual-sdk-download")),
            `~ by ${colors.bold('Exaecut')}`,
        ].join("\n"));

        console.log(`👉 ${colors.bold("Got any issues?")} https://github.com/exaecut/create-adobe-plugin/issues`);
        console.log(`🙏 ${colors.bold("Want to sponsor us ?")} https:/exaecut.io/sponsor`);
    } catch (error) {
        spinner.fail(`${colors.red("✖")} Failed to create your plugin ${colors.blue(pluginConfig.name)}!`);
        console.error(error);
        process.exit(1);
    }
}

await main().catch((error: Error) => console.error(error));
