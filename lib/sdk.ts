import { getOS, sdkList } from "./utils"

import type { AdobeSoftwares } from "./types";

export const downloadSDK = async (software: AdobeSoftwares) => {
    const sdkUrl = sdkList[getOS()][software];

    if (!sdkUrl) {
        throw new Error(`Unsupported software: ${software}`);
    }
}