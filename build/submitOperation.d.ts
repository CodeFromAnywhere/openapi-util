import { O } from "from-anywhere";
import { OpenapiParameterObject } from "./openapi-types.js";
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
/**
 * Fills headers, path, query, cookies, and body into a fetch in the right way according to the spec.
 *
 * Returns an executed fetch-call */
export declare const submitOperation: (context: {
    path: string;
    method: string;
    servers: {
        url: string | undefined;
    }[];
    parameters?: OpenapiParameterObject[];
    /** The combined data from your form. Flat object. */
    data: O;
}) => Promise<Response>;
//# sourceMappingURL=submitOperation.d.ts.map