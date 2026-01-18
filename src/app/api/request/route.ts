import { HTTP_STATUS_CODE, ResponseType } from '@/lib/types/apiResponse';
import { editMockStatusRequest } from '@/server/mock/requests';
import { ServerResponseBuilder } from '@/lib/builders/serverResponseBuilder';
import { InputException } from '@/lib/errors/inputExceptions';
import createRequest from '@/server/mongodb/actions/createItemRequest';
import { Error } from 'mongoose';
import { RequestStatus } from '@/lib/types/request';
import getItemRequests from '@/server/mongodb/actions/getItemRequests';
import { PAGINATION_PAGE_SIZE } from '@/lib/constants/config';
import updateItemRequest from '@/server/mongodb/actions/updateItemRequest';

export async function GET(request: Request) {
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as string | null;
    const page = parseInt(url.searchParams.get('page') || '1');

    // handle invalid status
    if (
        status &&
        !Object.values(RequestStatus).includes(status as RequestStatus)
    ) {
        return new Response(
            JSON.stringify({
                messge: `status must be one of ${
                    Object.values(RequestStatus).toString
                }`,
            }),
            { status: HTTP_STATUS_CODE.BAD_REQUEST }
        );
    }

    try {
        const result = await getItemRequests(status as RequestStatus, page);

        if (!(result instanceof Error)) {
            const { items, totItems } = result;
            // handle cursor out of bounds
            if (items.length == 0 && page > 0) {
                return new Response(
                    JSON.stringify({
                        message: `page ${page} is out of bounds`,
                    }),
                    { status: HTTP_STATUS_CODE.BAD_REQUEST }
                );
            } else {
                return new Response(
                    JSON.stringify({
                        data: items,
                        first: encodeURI(`/request?status=${status}&page=${0}`),
                        last: encodeURI(
                            `/request?status=${status}&page=${Math.ceil(totItems / PAGINATION_PAGE_SIZE)}`
                        ),
                    }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }
        } else {
            return new ServerResponseBuilder(
                ResponseType.UNKNOWN_ERROR
            ).build();
        }
    } catch (e) {
        if (e instanceof InputException) {
            return new ServerResponseBuilder(
                ResponseType.INVALID_INPUT
            ).build();
        }
        return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();

        // set the createdDate to today and set the status to pending
        data.createdDate = new Date();
        data.status = RequestStatus.PENDING;
        const newRequest = await createRequest(data);

        if (newRequest instanceof Error.ValidationError) {
            return new Response(JSON.stringify(newRequest.errors), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new ServerResponseBuilder(ResponseType.CREATED).build();
    } catch (e) {
        if (e instanceof InputException) {
            return new ServerResponseBuilder(
                ResponseType.INVALID_INPUT
            ).build();
        }
        return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
    }
}

export async function PATCH(request: Request) {
    try {
        const data = await request.json();

        // set the createdDate to today and set the status to pending
        data.lastEditedDate = new Date();
        const updatedRequest = await updateItemRequest(data);
        if (updatedRequest instanceof Error.ValidationError) {
            return new Response(JSON.stringify(updatedRequest.errors), {
                status: HTTP_STATUS_CODE.BAD_REQUEST,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new ServerResponseBuilder(ResponseType.SUCCESS).build();
    } catch (e) {
        if (e instanceof InputException) {
            return new ServerResponseBuilder(
                ResponseType.INVALID_INPUT
            ).build();
        }
        return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
    }
}
