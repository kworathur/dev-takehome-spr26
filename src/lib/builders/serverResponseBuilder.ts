import { RESPONSES, ResponseType } from '@/lib/types/apiResponse';

export class ServerResponseBuilder {
    private message: string;
    private status: number;

    constructor(responseType: ResponseType) {
        const responseDetails = RESPONSES[responseType];
        this.message = responseDetails.message;
        this.status = responseDetails.code;
    }

    setMessage(message: string): ServerResponseBuilder {
        this.message = message;
        return this;
    }
    build(): Response {
        return new Response(JSON.stringify({ message: this.message }), {
            status: this.status,
        });
    }
}
