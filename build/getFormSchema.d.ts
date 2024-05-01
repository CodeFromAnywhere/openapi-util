import { JSONSchema7 } from "json-schema";
import { HttpMethodEnum } from "./openapi-types.js";
import { OpenAPIV3 } from "openapi-types";
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
    servers: never[];
    schema: undefined;
    parameters?: undefined;
    securitySchemes?: undefined;
} | {
    schema: JSONSchema7;
    servers: {
        url: string;
        description?: string | undefined;
        variables?: {
            [variable: string]: OpenAPIV3.ServerVariableObject;
        } | undefined;
    }[];
    parameters: OpenAPIV3.ParameterObject[] | undefined;
    securitySchemes: {
        [key: string]: OpenAPIV3.SecuritySchemeObject;
    } | undefined;
}>;
//# sourceMappingURL=getFormSchema.d.ts.map