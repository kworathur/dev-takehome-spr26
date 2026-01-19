import connectDB from '..';
import { Request, RequestDocument, RequestType } from '../models/Request';
import { Error } from 'mongoose';

/**
 * Update item request with new @data
 * @param data to update the item request with
 * @returns item request with updated fields
 */
const updateItemRequest = async (
    data: Partial<RequestDocument>
): Promise<RequestDocument | Error | null> => {
    try {
        await connectDB();

        if (!data._id) {
            return new Error(`Data is missing required property _id`);
        }
        const itemRequest = await Request.findById(data._id);
        if (!itemRequest) {
            return new Error(`Item request with id ${data._id} not found`);
        }

        const updatedRequest = { ...itemRequest.toObject(), ...data };
        console.log(updatedRequest);
        // validate that the new status of the updated request
        // satisfies enum constraint
        const error = new Request(updatedRequest).validateSync();
        if (error) {
            return error;
        }

        await Request.findByIdAndUpdate(data._id, data);
    } catch (e) {
        return null;
    }
    return null;
};

export default updateItemRequest;
