import connectDB from '..';
import { Request, RequestDocument, RequestType } from '../models/Request';
import { Error } from 'mongoose';
const createRequest = async (
    data: RequestType
): Promise<RequestDocument | Error.ValidationError | null> => {
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
        console.error(`[ERROR]: Error encountered while creating new request`);
        return null;
    }
};

export default createRequest;
