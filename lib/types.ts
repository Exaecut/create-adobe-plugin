export type AdobeSoftwares = "aftereffects" | "premiere";

export interface PluginConfiguration {
    name: string
    category: string
    supportedSoftwares: AdobeSoftwares[]
}

export type AdobeSDK = {
    "windows": {
        [key in AdobeSoftwares]: string;
    },
    "mac": {
        [key in AdobeSoftwares]: string;
    }
};