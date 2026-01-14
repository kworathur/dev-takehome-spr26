import mongoose, { HydratedDocument, InferSchemaType, Model, Schema, model, models } from "mongoose";

const requestSchema = new Schema({
	requestorName: {
		type: String,
		required: true,
	},
    itemRequested: {
        type: String,
        required: true,
    },
    createdDate: {
        type: Date,
        default: Date.now(),
        required: true,
    }, 
    lastEditedDate: {
        type: Date,
        required: false
    },
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'APPROVED', 'REJECTED'],
        required: true

    }
});

export const Request: Model<InferSchemaType<typeof requestSchema>> = models.request ?? model('request', requestSchema);

/**
 * Extracts the “plain” shape of your schema—
 * just the fields you defined, without Mongoose’s built-in methods or `_id`.
 */
export type RequestType = InferSchemaType<typeof requestSchema>;

/**
 * Represents a fully “hydrated” Mongoose document:
 * your fields plus all of Mongoose’s methods and metadata
 * (e.g. `_id`, `save()`, `populate()`, etc.).
 */
export type RequestDocument = HydratedDocument<RequestType>;