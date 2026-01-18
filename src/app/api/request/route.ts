import { HTTP_STATUS_CODE, ResponseType } from '@/lib/types/apiResponse';
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
        return new ServerResponseBuilder(ResponseType.INVALID_INPUT)
            .setMessage(
                `status must be one of ${Object.values(RequestStatus).toString()}`
            )
            .build();
    }

    try {
        const result = await getItemRequests(status as RequestStatus, page);

        if (!(result instanceof Error)) {
            const { items, totItems } = result;
            // handle cursor out of bounds
            if (items.length == 0 && page > 1) {
                return new ServerResponseBuilder(ResponseType.INVALID_INPUT)
                    .setMessage(`page ${page} is out of bounds`)
                    .build();
            } else {
                return new Response(
                    JSON.stringify({
                        data: items,
                        first: encodeURI(
                            `/api/request?status=${status}&page=1`
                        ),
                        last: encodeURI(
                            `/api/request?status=${status}&page=${Math.max(1, Math.ceil(totItems / PAGINATION_PAGE_SIZE))}`
                        ),
                    }),
                    {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' },
                    }
                );
            }
        } else {
            return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR)
                .setMessage(result.message)
                .build();
        }
    } catch (e) {
        if (e instanceof InputException) {
            return new ServerResponseBuilder(
                ResponseType.INVALID_INPUT
            ).build();
        }
        console.error(e);

        return new ServerResponseBuilder(ResponseType.UNKNOWN_ERROR).build();
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json();

        // set the createdDate to today and set the status to pending
        data.requestCreatedDate = new Date();
        data.status = RequestStatus.PENDING;
        const newRequest = await createRequest(data);

        if (newRequest instanceof Error.ValidationError) {
            return new ServerResponseBuilder(ResponseType.INVALID_INPUT)
                .setMessage(JSON.stringify(newRequest.errors))
                .build();
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
        if (!data.id) {
            return new ServerResponseBuilder(ResponseType.INVALID_INPUT)
                .setMessage('ID is missing from payload')
                .build();
        }
        // set the createdDate to today and set the status to pending
        data._id = data.id;
        delete data.id;
        data.lastEditedDate = new Date();
        const updatedRequest = await updateItemRequest(data);
        if (updatedRequest instanceof Error.ValidationError) {
            return new ServerResponseBuilder(ResponseType.INVALID_INPUT)
                .setMessage(JSON.stringify(updatedRequest.errors))
                .build();
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
