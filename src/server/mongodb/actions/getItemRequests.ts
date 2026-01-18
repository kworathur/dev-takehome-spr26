import { RequestStatus } from '@/lib/types/request';
import connectDB from '..';
import { Request, RequestDocument } from '../models/Request';
import { Error } from 'mongoose';
import { PAGINATION_PAGE_SIZE } from '@/lib/constants/config';

const getItemRequests = async (
    filterStatus: RequestStatus,
    page: number
): Promise<{ items: RequestDocument[]; totItems: number } | Error> => {
    try {
        await connectDB();
        // sort before paginating results to ensure results are sorted
        // by created date in descending order
        const itemRequestsQuery = Request.find({ status: filterStatus });

        const totItemRequests = await itemRequestsQuery.countDocuments();

        const itemRequests = await itemRequestsQuery
            .sort('-requestCreatedDate')
            .skip(page * PAGINATION_PAGE_SIZE)
            .limit(PAGINATION_PAGE_SIZE);
        return { items: itemRequests, totItems: totItemRequests };
    } catch (err) {
        throw new Error('Failed to retrieve page of itemRequests');
    }
};

export default getItemRequests;
