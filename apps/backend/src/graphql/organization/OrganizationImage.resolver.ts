import { ApolloError } from "apollo-server-express";
import { config } from "config";
import { Permission } from "core";
import { IOrganization } from "db/Organization";
import { log } from "Logger";
import { Types } from "mongoose";
import * as path from "path";
import { RequestContext } from "RequestContext";
import {
    Arg,
    Authorized,
    Ctx,
    FieldResolver,
    Mutation,
    Resolver,
    Root,
    UnauthorizedError,
} from "type-graphql";
import { inspect } from "util";
import { deleteFiles, uploadFileFromStream } from "../../Storage";
import { generateImageName, generateResizedImage } from "../../Thumbnail";
import { FileInput } from "../file/File.input";
import { Organization } from "./Organization";

const opt = { nullable: true };

const logoSizes = {
    desktop: {
        height: 80,
    },
    mobile: {
        height: 80,
    },
};

@Resolver(Organization)
export class OrganizationImageResolver {
    //
    // Mutations
    //

    // upload the organization logo
    @Authorized()
    @Mutation((returns) => Organization)
    public async uploadOrganizationLogo(
        @Arg("input", (type) => FileInput) input: FileInput,
        @Ctx() context: RequestContext
    ) {
        const { file, cropX, cropY, cropWidth, cropHeight } = input;
        const { organization } = context;

        if (!organization) {
            throw new UnauthorizedError();
        }

        // check that the user has permission to update the organization
        if (!context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        //create file path
        const filePath = `organization/${organization.id}`;

        // delete the old logo if there is one
        if (organization.logo) {
            const prefix = `${filePath}/${organization.logo.id}`;

            // delete the files in storage
            await deleteFiles(prefix);

            organization.logo = undefined;
            await organization.save();
        }

        const { createReadStream, filename, mimetype } = await file;

        // construct the name to be used in storage
        const fileId = new Types.ObjectId();
        const name = `${filePath}/${fileId}`;
        const parsedPath = path.parse(filename);
        const extension = parsedPath.ext;

        // upload the original image
        const stream = createReadStream();

        // stream error handling
        stream.on("error", (error) => {
            throw new ApolloError(
                `An error occurred while uploading the image.`
            );
        });

        await uploadFileFromStream({
            stream,
            name: `${name}${extension}`,
            mimetype,
            overwrite: true,
        });

        // generate the resized images
        const baseOptions = {
            name,
            extension,
            cropX,
            cropY,
            cropHeight,
            cropWidth,
            format: "png",
        };
        await generateResizedImage(
            Object.assign({}, baseOptions, logoSizes.desktop) as any
        );

        // update logo image in the database
        organization.set("logo", {
            _id: fileId,
            label: filename,
            path: filePath,
            extension,
            mimetype,
            cropX,
            cropY,
            cropHeight,
            cropWidth,
        });
        await organization.save();

        // return the updated organization
        return organization;
    }

    // upload the organization logo (mobile version)
    @Authorized()
    @Mutation((returns) => Organization)
    public async uploadOrganizationLogoMobile(
        @Arg("input", (type) => FileInput) input: FileInput,
        @Ctx() context: RequestContext
    ) {
        const { file, cropX, cropY, cropWidth, cropHeight } = input;
        const { organization } = context;

        if (!organization) {
            throw new UnauthorizedError();
        }

        // check that the user has permission to update the organization
        if (!context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        //create file path
        const filePath = `organization/${organization.id}`;

        // delete the old logo if there is one
        if (organization.logoMobile) {
            const prefix = `${filePath}/${organization.logoMobile.id}`;

            // delete the files in storage
            await deleteFiles(prefix);

            organization.logo = undefined;
            await organization.save();
        }

        const { createReadStream, filename, mimetype } = await file;

        // construct the name to be used in storage
        const fileId = new Types.ObjectId();
        const name = `${filePath}/${fileId}`;
        const parsedPath = path.parse(filename);
        const extension = parsedPath.ext;

        // upload the original image
        const stream = createReadStream();

        // stream error handling
        stream.on("error", (error) => {
            throw new ApolloError(
                `An error occurred while uploading the image.`
            );
        });

        await uploadFileFromStream({
            stream,
            name: `${name}${extension}`,
            mimetype,
            overwrite: true,
        });

        // generate the resized images
        const baseOptions = {
            name,
            extension,
            cropX,
            cropY,
            cropHeight,
            cropWidth,
            format: "png",
        };
        await generateResizedImage(
            Object.assign({}, baseOptions, logoSizes.mobile) as any
        );

        // update logo image in the database
        organization.set("logoMobile", {
            _id: fileId,
            label: filename,
            path: filePath,
            extension,
            mimetype,
            cropX,
            cropY,
            cropHeight,
            cropWidth,
        });
        await organization.save();

        // return the updated organization
        return organization;
    }

    // deletes the organization logo
    @Authorized()
    @Mutation((returns) => Organization)
    public async deleteOrganizationLogo(@Ctx() context: RequestContext) {
        const { organization } = context;
        if (!organization) {
            throw new UnauthorizedError();
        }

        // check that the user has permission to update the organization
        if (!context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        if (!organization.logo) {
            // don't do anything since there is no logo
            return;
        }

        // construct the prefix of the files to be deleted from storage
        const prefix = `${organization.logo.path}/${organization.logo.id}`;

        // delete the files in storage
        try {
            await deleteFiles(prefix);
        } catch (error) {
            log.error("[deleteOrganizationLogo] " + inspect(error));
        }

        // update the organization logo
        organization.logo = undefined;
        await organization.save();

        // return the organization
        return organization;
    }

    // deletes the organization logo (mobile version)
    @Authorized()
    @Mutation((returns) => Organization)
    public async deleteOrganizationLogoMobile(@Ctx() context: RequestContext) {
        const { organization } = context;
        if (!organization) {
            throw new UnauthorizedError();
        }

        // check that the user has permission to update the organization
        if (!context.can(Permission.updateOrganization)) {
            throw new UnauthorizedError();
        }

        if (!organization.logoMobile) {
            // don't do anything since there is no logo
            return;
        }

        // construct the prefix of the files to be deleted from storage
        const prefix = `${organization.logoMobile.path}/${organization.logoMobile.id}`;

        // delete the files in storage
        try {
            await deleteFiles(prefix);
        } catch (error) {
            log.error("[deleteOrganizationLogo] " + inspect(error));
        }

        // update the organization logo
        organization.logoMobile = undefined;
        await organization.save();

        // return the organization
        return organization;
    }

    //
    // Fields
    //

    @FieldResolver((returns) => String, opt)
    public logoOriginal(@Root() { logo }: IOrganization): string | null {
        if (!logo) {
            return null;
        }
        return `https://${config.storage.bucket}/${logo.path}/${logo.id}${logo.extension}`;
    }

    @FieldResolver((returns) => String, opt)
    public logo(@Root() { logo }: IOrganization): string | null {
        if (!logo) {
            return null;
        }
        const fileName = generateImageName(
            logo.id,
            undefined,
            logoSizes.desktop.height,
            "png"
        );
        return `https://${config.storage.bucket}/${logo.path}/${fileName}`;
    }

    @FieldResolver((returns) => String, opt)
    public logoMobileOriginal(
        @Root() { logoMobile }: IOrganization
    ): string | null {
        if (!logoMobile) {
            return null;
        }
        return `https://${config.storage.bucket}/${logoMobile.path}/${logoMobile.id}${logoMobile.extension}`;
    }

    @FieldResolver((returns) => String, opt)
    public logoMobile(@Root() { logoMobile }: IOrganization): string | null {
        if (!logoMobile) {
            return null;
        }
        const fileName = generateImageName(
            logoMobile.id,
            undefined,
            logoSizes.mobile.height,
            "png"
        );
        return `https://${config.storage.bucket}/${logoMobile.path}/${fileName}`;
    }
}
