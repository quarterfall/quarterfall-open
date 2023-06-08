import mongoose = require("mongoose");
import { environment } from "config";
import "reflect-metadata";
import createOrganization from "./createOrganization";

(async () => {
    console.log(`Starting script (${environment}).`);
    // Initialize Mongoose
    console.log(`Connecting to the database.`);

    // Connect
    await mongoose.connect(process.env.DB_CONNECTION_STRING || "");
    console.log("Database connected");

    // Edit this to create a new organization
    await createOrganization({
        name: "Quarterfall",
        emailAddress: "info@example.com",
    });

    console.log("Finished.");
})();
