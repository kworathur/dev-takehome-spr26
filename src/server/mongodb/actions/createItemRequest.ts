import connectDB from '..';
import { Request, RequestDocument, RequestType } from '../models/Request';
import { Error } from 'mongoose';

/**
 * Create a new item request
 * @param data request data for creating the item request
 * @returns item request with ID on successful creation, error on DB driver exception
 */
const createRequest = async (
    data: RequestType
): Promise<RequestDocument | Error> => {
    try {
        await connectDB();
        const newRequest = new Request(data);
        const error = newRequest.validateSync();
        if (error) {
            return error;
        }
        await newRequest.save();
        return newRequest;
    } catch (err) {
        throw new Error(`Failed to create new itemRequest`);
    }
};

export default createRequest;
