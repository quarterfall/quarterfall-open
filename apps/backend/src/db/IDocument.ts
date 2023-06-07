import mongoose = require("mongoose");

export interface IDocument extends mongoose.Document {
    createdAt: Date;
    updatedAt: Date;
    metadata?: any;
}
