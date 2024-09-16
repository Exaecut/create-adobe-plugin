import type { AdobeSoftwares, PluginConfiguration } from "./lib/types";
import { cancel, confirm, group, groupMultiselect, intro, log, multiselect, note, outro, spinner, text } from "@clack/prompts";
import { getOS, getSDKInstallPath, initGitRepo, sdkList, setPersistentEnvVar } from "./lib/utils";

import cliProgress from "cli-progress";
import colors from "picocolors"

async function main() {
    console.clear();
    intro("Configure your Adobe plugin");

    let pluginName: Promise<string | symbol>;
    const pluginConfig = await group({
        name: () => {
            pluginName = text({
                message: "What is the name of your plugin?",
                placeholder: "new-adobe-plugin",
                defaultValue: "new-adobe-plugin"
            });

            return pluginName
        },
        pluginPath: async () => text({
            message: "What is the path of your plugin?",
            placeholder: `./${String(await pluginName)}`,
            defaultValue: `./${String(await pluginName)}`
        }),
        category: () => text({
            message: "Under which category your plugin belongs?",
            placeholder: "Type a plugin category",
            defaultValue: "No Category"
        }),
        git: () => group({
            initialize: () => confirm({
                message: "Initialize git repository?",
                initialValue: true,
                active: "Yes",
                inactive: "No"
            }),
            originPath: async () => text({
                message: "What is the path of your git repository?",
                placeholder: `https://github.com/.../${String(await pluginName)}`,
            })
        }, {
            onCancel: () => {
                cancel("Don't initialize git repository")
            }
        }),
    }, {
        onCancel: () => {
            cancel("Cancelled!")
            process.exit(0)
        }
    });

    note(`Your plugin configuration:
    - Name: ${pluginConfig.name}
    - Path: ${pluginConfig.pluginPath}
    - Category: ${pluginConfig.category}
    - Initialize git: ${pluginConfig.git.initialize ? "Yes" : "No"}
    - Git repo url: ${pluginConfig.git.originPath ? pluginConfig.git.originPath : "Not defined"}`,
        "Summary");

    const confirmation = await confirm({ message: "Do you confirm the plugin configuration?", active: "Yes", inactive: "No", initialValue: true });
    if (!confirmation) {
        cancel("Cancelled!")
        process.exit(0)
    }

    const progress = spinner();

    progress.start("Creating your plugin...");

    if (pluginConfig.git.initialize) {
        await initGitRepo(pluginConfig.git.originPath, pluginConfig.pluginPath);
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

    await new Promise((resolve) => setTimeout(resolve, 2000));
    progress.stop(`${colors.green("✔")} Successfully created your plugin ${colors.blue(pluginConfig.name)} !`);

    note([
        `1. cd ./${pluginConfig.name}`,
        `2. code .`,
        `3. make build`,
        colors.yellow(colors.bold("⚠️ IMPORTANT: Manual SDK download is required: https://github.com/exeacut/create-adobe-plugin#manual-sdk-download")),
    ].join("\n"), "Next steps");

    outro("Got any issues? Please open an issue at https://github.com/exeacut/create-adobe-plugin/issues");
}

await main().catch((error) => log.error(error));