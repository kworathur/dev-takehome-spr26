import { RequestStatus } from '@/lib/types/request';
import connectDB from '..';
import { Request, RequestDocument, RequestType } from '../models/Request';
import { Error } from 'mongoose';
import { PAGINATION_PAGE_SIZE } from '@/lib/constants/config';

const getItemRequests = async (
    filterStatus: RequestStatus,
    page: number
): Promise<RequestDocument[] | Error.ValidationError | null> => {
    try {
        await connectDB();
        const itemRequests = await Request.find({ status: filterStatus })
            .skip(page * PAGINATION_PAGE_SIZE)
            .limit(PAGINATION_PAGE_SIZE);

        return itemRequests;
    } catch (err) {
        console.error(
            `[ERROR]: Error encountered while retrieving item requests`
        );
        return null;
    }
};

export default getItemRequests;
