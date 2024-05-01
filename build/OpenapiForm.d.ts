import { Keys } from "from-anywhere";
import { HttpMethodEnum } from "./openapi-types.js";
export type OperationPartial = {
    responses: {
        "200": {
            content: {
                "application/json": {
                    schema: any;
                };
            };
        };
    };
};
/** Simple Openapi form */
export declare const OpenapiForm: <T extends {
    paths: {
        [key: string]: {
            get?: OperationPartial | undefined;
            put?: OperationPartial | undefined;
            post?: OperationPartial | undefined;
            delete?: OperationPartial | undefined;
            options?: OperationPartial | undefined;
            head?: OperationPartial | undefined;
            patch?: OperationPartial | undefined;
            trace?: OperationPartial | undefined;
        };
    };
}, P extends Keys<T["paths"]>, M extends keyof T["paths"][P] & HttpMethodEnum>(props: {
    /** You can provide a direct JSON import of the OpenAPI here just in order to gain typescript type inference for the paths and methods */
    openapi?: T | undefined;
    openapiUri: string;
    path: P;
    method: M;
    /**
     * Do something after you get a response back
     *
     * NB: tried to get the response type but it's nearly impossible from such a deep JSON. `json-schema-to-ts` doesn't work so well: Type instantiation is excessively deep and possibly infinite
     */
    withResponse: (response: any, statusCode: number, status: string) => void;
}) => Promise<any>;
//# sourceMappingURL=OpenapiForm.d.ts.map