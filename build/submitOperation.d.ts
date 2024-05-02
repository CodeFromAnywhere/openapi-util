import { O } from "from-anywhere";
import { OpenapiParameterObject } from "./openapi-types.js";
import { OpenAPIV3 } from "openapi-types";
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
 * Returns an executed fetch-call
 *
 * NB: I'm not following the security spec perfectly yet, nor is any frontend validation happening. Let's do this at a later stage.
 */
export declare const submitOperation: (context: {
    path: string;
    method: string;
    servers: {
        url: string;
    }[];
    parameters?: OpenAPIV3.ParameterObject[] | undefined;
    securitySchemes: {
        [key: string]: OpenAPIV3.SecuritySchemeObject;
    } | undefined;
    /** The combined data from your form. Flat object. */
    data: O;
}) => Promise<Response>;
//# sourceMappingURL=submitOperation.d.ts.map