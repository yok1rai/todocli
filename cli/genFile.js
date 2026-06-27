import os from "os";
import fs from "fs";
import path from "path";

const appName = "todocli";

export function jsonExists(filePath) {
    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify([]), "utf-8");
        return [];
    }

    const data = fs.readFileSync(filePath, "utf-8");

    try {
        return JSON.parse(data);
    } catch {
        // if corrupted, reset it
        fs.writeFileSync(filePath, JSON.stringify([]), "utf-8");
        return [];
    }
}

function getConfigPath() {
    const platform = os.platform();

    let configDir;

    switch (platform) {
        case "win32":
            configDir = path.join(process.env.APPDATA || "", appName);
            break;

        case "darwin":
            configDir = path.join(os.homedir(), "Library", "Application Support", appName);
            break;

        case "linux":
            configDir = path.join(os.homedir(), ".config", appName);
            break;

        default:
            throw new Error("Unsupported OS");
    }

    const configFile = path.join(configDir, "data.json");

    fs.mkdirSync(configDir, { recursive: true });

    jsonExists(configFile);

    return configFile;
}

export default getConfigPath;
