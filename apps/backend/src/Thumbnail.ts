import sharp from "sharp";
import { log } from "./Logger";
import { generateProcessedImage } from "./Storage";

export interface GenerateResizedImageOptions {
    cropX?: number;
    cropY?: number;
    cropWidth?: number;
    cropHeight?: number;
    width?: number;
    height?: number;
    format: "jpeg" | "png";
    name: string;
    extension: string;
}

export const generateResizedImage = async (
    options: GenerateResizedImageOptions
) => {
    log.debug("Creating image processor with options. ", options);
    const imageProcessor = createImageProcessor(options);
    const imageName = generateImageName(
        options.name,
        options.width,
        options.height,
        options.format
    );
    log.debug(`Generated image name ${imageName}.`);
    return generateProcessedImage(
        `${options.name}${options.extension}`,
        imageName,
        imageProcessor,
        options.format
    );
};

export function generateImageName(
    name: string,
    width?: number,
    height?: number,
    format: string = "jpeg"
): string {
    // Create the new file name
    let thumbFileName = `${name}_qf`;

    // add size if needed
    if (width !== undefined && height !== undefined) {
        thumbFileName += `_${width}x${height}`;
    } else if (width === undefined && height !== undefined) {
        thumbFileName += `_${height}h`;
    } else if (height === undefined && width !== undefined) {
        thumbFileName += `_${width}w`;
    }

    // set the file extension
    switch (format) {
        case "jpeg":
            thumbFileName += `.jpg`;
            break;
        case "png":
            thumbFileName += `.png`;
            break;
    }

    return thumbFileName;
}

export interface GenerateImageOptions {
    cropX?: number;
    cropY?: number;
    cropWidth?: number;
    cropHeight?: number;
    width?: number;
    height?: number;
    format: "jpeg" | "png";
}

export function createImageProcessor(options: GenerateImageOptions): any {
    const { width, height, cropX, cropY, cropWidth, cropHeight, format } =
        options;

    // create the image processor
    let imageProcessor = sharp();

    // crop the image if needed
    if (
        cropX !== undefined &&
        cropY !== undefined &&
        cropWidth !== undefined &&
        cropHeight !== undefined
    ) {
        imageProcessor = imageProcessor.extract({
            width: cropWidth,
            height: cropHeight,
            left: cropX,
            top: cropY,
        });
    }

    // resize the image if needed
    if (width !== undefined || height !== undefined) {
        imageProcessor = imageProcessor.resize({ width, height });
    }

    // change the output format if needed
    switch (format) {
        case "jpeg":
            imageProcessor = imageProcessor.jpeg({
                quality: 100,
            });
            break;
        case "png":
            imageProcessor = imageProcessor.png();
            break;
    }

    return imageProcessor;
}
