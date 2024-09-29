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

export const getExaecutDataPath = (suffix?: string): string => {
    if (os.platform() === 'win32') {
        if (!fs.existsSync(path.join(os.homedir(), 'AppData', 'Roaming', 'exaecut', suffix ?? ''))) {
            fs.mkdirSync(path.join(os.homedir(), 'AppData', 'Roaming', 'exaecut', suffix ?? ''), { recursive: true });
        }

        return path.join(os.homedir(), 'AppData', 'Roaming', 'exaecut', suffix ?? '');
    } else if (os.platform() === 'darwin') {
        if (!fs.existsSync(path.join(os.homedir(), 'Library', 'Application Support', 'exaecut', suffix ?? ''))) {
            fs.mkdirSync(path.join(os.homedir(), 'Library', 'Application Support', 'exaecut', suffix ?? ''), { recursive: true });
        }

        return path.join(os.homedir(), 'Library', 'Application Support', 'exaecut', suffix ?? '');
    } else {
        throw new Error('Unsupported platform');
    }
}

export const getPluginInstallationFolder = () =>
    path.join(
        os.platform() === "win32" ? "C:" : "/",
        os.platform() === "win32" ? "Program Files" : "Library",
        "Adobe", "Common", "Plug-ins", "7.0", "MediaCore"
    );

export const getSDKInstallPath = (software: AdobeSoftwares): string => {
    const osType = os.platform();

    if (osType === 'win32') {
        if (!fs.existsSync(path.join(os.homedir(), 'AppData', 'Roaming', 'exaecut', 'adobe-sdks', software))) {
            fs.mkdirSync(path.join(os.homedir(), 'AppData', 'Roaming', 'exaecut', 'adobe-sdks', software), { recursive: true });
        }

        return path.join(os.homedir(), 'AppData', 'Roaming', 'exaecut', 'adobe-sdks', software);
    } else if (osType === 'darwin') {
        if (!fs.existsSync(path.join(os.homedir(), 'Library', 'Application Support', 'exaecut', 'adobe-sdks', software))) {
            fs.mkdirSync(path.join(os.homedir(), 'Library', 'Application Support', 'exaecut', 'adobe-sdks', software), { recursive: true });
        }

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

export const initGitRepo = (repoUrl: string | symbol | null, localPath: string) => {
    try {
        if (typeof repoUrl === "symbol") {
            repoUrl = null;
        }

        // Navigate to the desired directory and initialize the Git repository
        const normalizedPath = path.resolve(localPath);
        child_process.execSync(`git init`, { cwd: normalizedPath, stdio: 'pipe' });

        // Add the remote repository
        if (repoUrl) {
            child_process.execSync(`git remote add origin ${repoUrl}`, { cwd: normalizedPath, stdio: 'pipe' });
        }

        console.log(repoUrl ? `\nGit repository initialized at ${normalizedPath} and connected to ${repoUrl}` : `\nGit repository initialized at ${normalizedPath}`);
    } catch (error) {
        console.error(`Failed to initialize Git repository:`, error);
    }
};

export const appendToSystemPath = (folderPath: string) => {
    const currentPath = process.env.PATH || '';

    // Check if the folder is already in PATH
    if (currentPath.includes(folderPath)) {
        console.log(`Folder already in PATH: ${folderPath}`);
        return;
    }

    if (os.platform() === 'win32') {
        try {
            child_process.spawnSync(`powershell`, ["./scripts/tools.ps1"], { stdio: 'ignore' });
        } catch (error) {
            console.error('Failed to update the PATH using PowerShell:', error);
        }
    } else {
        const profile = process.env.SHELL?.includes('zsh') ? '~/.zshrc' : '~/.bashrc';
        child_process.execSync(`echo 'export PATH="${folderPath}:$PATH"' >> ${profile}`);
        console.log(`Folder appended to ${profile}: ${folderPath}`);
        console.log('Run "source ~/.zshrc" or "source ~/.bashrc" to apply changes.');
    }
};