import { Storage } from "@google-cloud/storage";
import { config } from "config";
import { Stream } from "stream";
import { log } from "./Logger";

// Initialize the Google Storage and the upload bucket
const storage = new Storage({
    projectId: config.google.projectId,
    credentials: {
        client_email: config.google.clientEmail,
        private_key: config.google.privateKey,
    },
});
const bucket = storage.bucket(config.storage.bucket);

export async function fileExists(name: string): Promise<boolean> {
    const file = bucket.file(name);
    const data = await file.exists();
    return data[0];
}

export async function generateProcessedImage(
    originalName: string,
    name: string,
    imageProcessor: any,
    format: "jpeg" | "png"
): Promise<void> {
    // retrieve the original file reference in the bucket
    if (!(await fileExists(originalName))) {
        throw new Error(`File with name ${originalName} doesn't exist.`);
    }
    const fileRef = bucket.file(originalName);

    // Create write stream for uploading the thumbnail
    const thumbnailUploadStream = bucket.file(name).createWriteStream({
        contentType: `image/${format}`,
    });

    return new Promise<void>((resolve, reject) => {
        // create a read stream, and pipe it through the image processor to the upload stream
        const pipeline = fileRef
            .createReadStream()
            .pipe(imageProcessor)
            .on("error", (err) => {
                log.debug("Read pipeline error: ", err);
                reject(err);
            });
        pipeline.pipe(thumbnailUploadStream);

        thumbnailUploadStream.on("finish", resolve).on("error", (err) => {
            log.debug("Write pipeline error: ", err);
            reject(err);
        });
    });
}

interface UploadFileFromStreamOptions {
    stream: Stream;
    name: string;
    mimetype: string;
    fileSize?: number;
    overwrite?: boolean;
}

export async function uploadFileFromStream(
    options: UploadFileFromStreamOptions
): Promise<string> {
    const {
        name,
        mimetype,
        stream,
        fileSize = config.fileSizeLimits.default,
        overwrite = false,
    } = options;

    // check if the file already exists
    if (!overwrite && (await fileExists(name))) {
        throw new Error("File already exists.");
    }

    // to do: add file size checks

    return new Promise<string>((resolve, reject) => {
        const storageFile = bucket.file(name);
        const upload = storageFile.createWriteStream({
            metadata: {
                contentType: mimetype,
            },
        });
        upload.on("error", (err) => {
            reject(err);
        });
        upload.on("finish", () => {
            resolve(name);
        });

        // Pipe the Readable stream to the Google storage write stream
        stream.pipe(upload);
    });
}

export async function deleteFile(name: string) {
    if (!(await fileExists(name))) {
        throw new Error(`File with name ${name} doesn't exist.`);
    }
    const fileRef = bucket.file(name);
    return fileRef.delete();
}

export async function deleteFiles(prefix: string) {
    return bucket.deleteFiles({ prefix });
}

export async function copyFile(sourceName: string, destinationName: string) {
    const fileRef = bucket.file(sourceName);
    if (!(await fileExists(sourceName))) {
        throw new Error(`File with name ${sourceName} doesn't exist.`);
    }
    return fileRef.copy(destinationName);
}

export async function listFiles(prefix: string): Promise<string[]> {
    const data = await bucket.getFiles({
        prefix: prefix,
    });
    return data[0].map((value) => value.name);
}

export function getFileDownloadLink(name: string): string {
    return `https://${config.storage.bucket}/${name}`;
}
