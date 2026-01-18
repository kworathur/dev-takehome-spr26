import connectDB from '..';
import { Request, RequestDocument, RequestType } from '../models/Request';
import { Error } from 'mongoose';

// updates data with given _id
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

        const updatedItem: RequestType = {
            ...itemRequest,
            ...data,
        };
        const error = new Request(updatedItem).validateSync();
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
