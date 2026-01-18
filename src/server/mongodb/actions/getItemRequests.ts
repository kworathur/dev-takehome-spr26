import { RequestStatus } from '@/lib/types/request';
import connectDB from '..';
import { Request, RequestDocument } from '../models/Request';
import { Error } from 'mongoose';
import { PAGINATION_PAGE_SIZE } from '@/lib/constants/config';

const getItemRequests = async (
    filterStatus: RequestStatus | null,
    page: number
): Promise<{ items: RequestDocument[]; totItems: number } | Error> => {
    try {
        await connectDB();
        // sort before paginating results to ensure results are sorted
        // by created date in descending order
        const itemRequestsQuery = Request.find({
            ...(filterStatus && { status: filterStatus }),
        });

        const totItemRequests = await itemRequestsQuery.countDocuments();

        const itemRequests = await Request.find({
            ...(filterStatus && { status: filterStatus }),
        })
            .sort('-requestCreatedDate')
            .skip((page - 1) * PAGINATION_PAGE_SIZE)
            .limit(PAGINATION_PAGE_SIZE);
        return { items: itemRequests, totItems: totItemRequests };
    } catch (err) {
        throw new Error(
            `Failed to retrieve page ${page} of itemRequests ` + err
        );
    }
};

export default getItemRequests;
