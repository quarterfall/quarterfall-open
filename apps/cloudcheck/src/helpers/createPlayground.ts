import { log } from "./logger";
import { runCommand } from "./runCommand";
import { runScript } from "./runScript";
import fs = require("fs");

interface CreatePlaygroundOptions {
    gitUrl?: string;
    gitBranch?: string;
    gitPrivateKey?: string;
    gitPath?: string;
    forceOverrideCache?: boolean;
    gitCacheCreationDateTime?: number;
    localPath: string;
    requestId: string;
    log: string[];
}

async function createLocalPlayground(options: CreatePlaygroundOptions) {
    let { localPath, requestId } = options;
    log.debug(`[${requestId}] Making local path copy...`);
    // we're dealing with a local path
    const path = `static/${localPath}`;
    if (!fs.existsSync(path)) {
        throw new Error(`No local path ${localPath} found.`);
    }
    // copy the local folder to the playground
    fs.mkdirSync(`${requestId}/${localPath}`, { recursive: true });
    await runCommand(`cp -r ${path}/. ${requestId}/${localPath}`);

    return;
}

export async function createPlayground(options: CreatePlaygroundOptions) {
    let {
        gitUrl,
        gitBranch = "master",
        gitPrivateKey,
        gitPath = ".",
        gitCacheCreationDateTime,
        forceOverrideCache = false,
        localPath,
        requestId,
        log: exitLog,
    } = options;

    // Create local playground for unit test action
    if (!gitUrl) {
        await createLocalPlayground(options);
    }

    log.debug(`[${requestId}] Retrieving git repository...`);

    const cacheFolderName = Buffer.from(
        `${gitUrl}_${gitBranch}_${gitPath}`
    ).toString("base64");

    // Check if one day has passed since the cache was created

    const currentTime = Date.now();
    const oneDayInMilliSeconds = 1000 * 60 * 60 * 24;
    const oneDayHasPassed =
        currentTime - gitCacheCreationDateTime > oneDayInMilliSeconds;

    const cacheNeedsToBeRemoved = forceOverrideCache || oneDayHasPassed;

    if (cacheNeedsToBeRemoved && fs.existsSync(cacheFolderName)) {
        log.debug(`[${requestId}] Removing cache folder...`);
        await runCommand(`rm -r ${cacheFolderName}`);
    }

    let command = `git clone -b ${gitBranch} --depth=1 ${gitUrl} ${cacheFolderName}`;
    if (gitPrivateKey) {
        // add missing LF if needed
        let keyData = gitPrivateKey;
        if (!/[\r\n]$/.test(keyData)) {
            keyData += "\n";
        }
        // create a file containing the private key
        const keyFilename = `./${requestId}_id_rsa`;
        fs.writeFileSync(keyFilename, keyData, { mode: 0o600 });
        // add the private key to the git command
        command = `GIT_SSH_COMMAND='ssh -i ${keyFilename}' ${command}`;
    }

    if (!fs.existsSync(cacheFolderName)) {
        // Before creating the cache store the time in a variable
        gitCacheCreationDateTime = Date.now();

        log.debug(`[${requestId}] Cloning git repository to cache...`);

        // Clone git repo to cache
        await runCommand(command);

        // run the install script
        if (fs.existsSync(`./${cacheFolderName}/${gitPath}/install.sh`)) {
            // run the install script
            log.debug(`[${requestId}] Running install script...`);
            await runScript({
                script: `./install.sh`,
                cwd: `./${cacheFolderName}/${gitPath}`,
                log: exitLog,
            });
        } else {
            // there is no install script present
            exitLog.push("No install script was run.");
        }
    }

    log.debug(`[${requestId}] Copying git cache to request path...`);

    if (!fs.existsSync(`${requestId}${localPath}`)) {
        await runCommand(`mkdir -p ${requestId}${localPath}`);
    }
    // Copy cache to request path
    await runCommand(
        `cp -R ${cacheFolderName}/${gitPath}/* ${requestId}${localPath}`
    );
}
