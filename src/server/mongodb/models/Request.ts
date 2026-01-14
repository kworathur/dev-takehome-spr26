import mongoose, {
    HydratedDocument,
    InferSchemaType,
    Model,
    Schema,
    model,
    models,
} from 'mongoose';

const requestSchema = new Schema({
    requestorName: {
        type: String,
        required: 'requestor name is required',
    },
    itemRequested: {
        type: String,
        required: 'item requested is required',
    },
    requestCreatedDate: {
        type: Date,
        required: 'created date is required', // note: client code must add createdDate timestamp to request data
    },
    lastEditedDate: {
        type: Date,
        default: Date.now(),
        required: false,
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'completed', 'approved', 'rejected'],
            message: '{VALUE} is not supported',
        },
        required: true,
    },
});

export const Request: Model<InferSchemaType<typeof requestSchema>> =
    models.request ?? model('request', requestSchema);

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
