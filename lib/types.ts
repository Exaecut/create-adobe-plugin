export type AdobeSoftwares = "aftereffects" | "premiere";

export type PluginConfig = {
    name: string;
    pluginPath: string;
    category: string;
    initializeGit: boolean;
}

export type AdobeSDK = {
    "windows": {
        [key in AdobeSoftwares]: string;
    },
    "mac": {
        [key in AdobeSoftwares]: string;
    }
};