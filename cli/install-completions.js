import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const home = os.homedir();
const shell = process.env.SHELL || "";

function safeMkdir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function copy(source, dest) {
    safeMkdir(path.dirname(dest));
    fs.copyFileSync(source, dest);
}

function installFish() {
    try {
        const src = path.join(__dirname, "completions/todocli.fish");
        const destDir = path.join(home, ".config/fish/completions");
        const dest = path.join(destDir, "todocli.fish");

        copy(src, dest);

        console.log("✓ Fish completions installed");
    } catch (e) {
        console.log("✗ Fish install failed:", e.message);
    }
}

function installZsh() {
    try {
        const src = path.join(__dirname, "completions/todocli.zsh");
        const compDir = path.join(home, ".zsh/completions");
        const zshrc = path.join(home, ".zshrc");

        const dest = path.join(compDir, "_todocli");

        copy(src, dest);

        const marker = "# todocli-completions";
        const initLine = `
${marker}
fpath=(${compDir} $fpath)
autoload -U compinit && compinit
`;

        if (fs.existsSync(zshrc)) {
            const content = fs.readFileSync(zshrc, "utf-8");
            if (!content.includes(marker)) {
                fs.appendFileSync(zshrc, initLine);
            }
        } else {
            fs.writeFileSync(zshrc, initLine);
        }

        console.log("✓ Zsh completions installed");
    } catch (e) {
        console.log("✗ Zsh install failed:", e.message);
    }
}

function installBash() {
    try {
        const src = path.join(__dirname, "completions/todocli.bash");

        const destDir = path.join(home, ".local/share/bash-completion/completions");
        const dest = path.join(destDir, "todocli");

        copy(src, dest);

        console.log("✓ Bash completions installed");
        console.log("  (make sure bash-completion is enabled in your system)");
    } catch (e) {
        console.log("✗ Bash install failed:", e.message);
    }
}

function detectAndInstall() {
    console.log("Installing shell completions...\n");

    const isFish = shell.includes("fish");
    const isZsh = shell.includes("zsh");
    const isBash = shell.includes("bash");

    if (isFish) installFish();
    else if (isZsh) installZsh();
    else if (isBash) installBash();
    else {
        console.log("Unknown shell, installing for all...\n");
        installFish();
        installZsh();
        installBash();
    }

    console.log("\nDone.");
}

detectAndInstall();
