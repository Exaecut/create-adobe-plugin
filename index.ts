import type { AdobeSoftwares, PluginConfiguration } from "./lib/types";
import { cancel, confirm, group, intro, log, multiselect, note, outro, spinner, text } from "@clack/prompts";
import { getOS, getSDKInstallPath, sdkList, setPersistentEnvVar } from "./lib/utils";

import cliProgress from "cli-progress";
import colors from "picocolors"

async function main() {
    console.clear();
    intro("Welcome, let's create your plugin!");

    const pluginConfig = await group({
        name: () => text({
            message: "What is the name of your plugin?",
            placeholder: "Type a plugin name",
            defaultValue: "my-adobe-plugin"
        }),
        category: () => text({
            message: "Under which category your plugin belongs?",
            placeholder: "Type a plugin category",
            defaultValue: "No Category"
        }),
        supportedSoftwares: () => multiselect({
            message: "Which softwares are supported by your plugin? (Use spacebar to select)",
            options: [
                {
                    value: "aftereffects",
                    label: "After Effects",
                },
                {
                    value: "premiere",
                    label: "Premiere Pro",
                }
            ],
            required: true,
            initialValues: ["aftereffects", "premiere"]
        })
    }, {
        onCancel: () => {
            cancel("Cancelled!")
            process.exit(0)
        }
    });

    note(`Your plugin configuration:
    - Name: ${pluginConfig.name}
    - Category: ${pluginConfig.category}
    - Supported softwares: ${pluginConfig.supportedSoftwares.join(", ")}`, "Summary");

    const confirmation = await confirm({ message: "Do you confirm the plugin configuration?", active: "Yes", inactive: "No", initialValue: true });
    if (!confirmation) {
        cancel("Cancelled!")
        process.exit(0)
    }

    const progress = spinner();

    progress.start("Creating your plugin...");

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