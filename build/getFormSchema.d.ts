import { JSONSchema7 } from "json-schema";
import { HttpMethodEnum } from "./openapi-types.js";
/** Resolves the body and all parameter schemas and merges them into a single schema
 *
 * Also resolves the to-be-used servers for the operation according to spec: https://learn.openapis.org/specification/servers.html#the-server-object
 *
 * When multiple servers arrays are specified at different levels for a given operation, only the lowest level one is taken into account.
 */
export declare const getFormSchema: (context: {
    openapiUri: string;
    path: string;
    method: HttpMethodEnum;
}) => Promise<{
    servers: {
        url: string;
        description?: string | undefined;
        variables?: {
            [variable: string]: import("openapi-types").OpenAPIV3.ServerVariableObject;
        } | undefined;
    }[];
    schema: undefined;
    parameters?: undefined;
} | {
    schema: JSONSchema7;
    servers: {
        url: string;
        description?: string | undefined;
        variables?: {
            [variable: string]: import("openapi-types").OpenAPIV3.ServerVariableObject;
        } | undefined;
    }[];
    parameters: import("openapi-types").OpenAPIV3.ParameterObject[] | undefined;
}>;
//# sourceMappingURL=getFormSchema.d.ts.map