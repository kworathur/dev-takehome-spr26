import { RequestStatus } from '@/lib/types/request';
import connectDB from '..';
import { Request, RequestDocument } from '../models/Request';
import { Error } from 'mongoose';
import { PAGINATION_PAGE_SIZE } from '@/lib/constants/config';

/**
 * Return a list of item requests, indexed by @page and
 * optionally filtered by @filterStatus
 * @param filterStatus status to filter requests on
 * @param page the page number to retrieve search results for
 * @returns paginated list of item requests sorted by creation date in descending order
 */
const getItemRequests = async (
    filterStatus: RequestStatus | null,
    page: number
): Promise<{ items: RequestDocument[]; totItems: number } | Error> => {
    try {
        await connectDB();

        const itemRequestsQuery = Request.find({
            ...(filterStatus && { status: filterStatus }),
        });

        const totItemRequests = await itemRequestsQuery.countDocuments();
        // sort before paginating results to ensure results are correctly
        // sorted in descending order
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
