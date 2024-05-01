import { OpenapiDocument } from "./openapi-types.js";
/**
 * Function that turns a regular function into an endpoint. If the function is available in the OpenAPI (with function name equalling the operationId), the input will be validated.
 *
 * NB: You can use this anywhere you want your openapi to be available. Usually it's in a catch-all route, but you can also use other next routing in case you need to have pages in some cases.
 */
export declare const resolveOpenapiAppRequest: (request: Request, method: string, config: {
    openapi: OpenapiDocument;
    functions: {
        [functionName: string]: (jsonBody: any) => any | Promise<any>;
    };
}) => Promise<Response>;
//# sourceMappingURL=resolveOpenapiAppRequest.d.ts.map