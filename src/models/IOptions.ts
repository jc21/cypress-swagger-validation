export interface IOptions {
    file?: string;
    endpoint: string;
    method: string;
    statusCode: number;
    contentType: string;
    responseSchema: object;
    verbose?: boolean;
}
