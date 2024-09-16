import type { AdobeSDK, AdobeSoftwares } from "./types";

import child_process from "child_process"
import fs from "fs"
import os from "os"
import path from "path"

export const sdkList: AdobeSDK = {
    windows: {
        aftereffects: "Adobe SDKs should be freely distributed without requiring a CC account",
        premiere: "Adobe SDKs should be freely distributed without requiring a CC account"
    },
    mac: {
        aftereffects: "Adobe SDKs should be freely distributed without requiring a CC account",
        premiere: "Adobe SDKs should be freely distributed without requiring a CC account"
    }
}

export function getOS(): "windows" | "mac" {
    const osType = os.platform();
    if (osType === "win32") return "windows";
    if (osType === "darwin") return "mac";
    throw new Error(`Unsupported platform: ${osType}`);
}

export const getSDKInstallPath = (software: AdobeSoftwares): string => {
    const osType = os.platform();

    if (osType === 'win32') {
        fs.mkdirSync(path.join(os.homedir(), 'AppData', 'Roaming', 'exaecut', 'adobe-sdks'), { recursive: true });
        return path.join(os.homedir(), 'AppData', 'Roaming', 'exaecut', 'adobe-sdks', software);
    } else if (osType === 'darwin') {
        fs.mkdirSync(path.join(os.homedir(), 'Library', 'Application Support', 'exaecut', 'adobe-sdks'), { recursive: true });
        return path.join(os.homedir(), 'Library', 'Application Support', 'exaecut', 'adobe-sdks', software);
    } else {
        throw new Error('Unsupported platform');
    }
}

export const setPersistentEnvVar = (name: string, value: string): boolean => {
    const platform = os.platform();

    if (platform === 'win32') {
        const envVars = child_process.execSync('set', { encoding: 'utf8', stdio: 'pipe' });
        if (envVars.includes(`${name}=`)) return false;
        child_process.execSync(`setx ${name} "${value}"`, { stdio: 'pipe' });
        return true;
    } else {
        const profilePath = path.join(os.homedir(), process.env.SHELL?.includes('zsh') ? '.zshrc' : '.bash_profile');
        const profileContent = fs.readFileSync(profilePath, 'utf8');
        if (profileContent.includes(`export ${name}=`)) return false;
        fs.appendFileSync(profilePath, `\nexport ${name}="${value}"\n`);
        return true;
    }
};