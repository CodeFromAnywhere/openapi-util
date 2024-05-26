import { JSONSchema7 } from "json-schema";
import { OpenAPIV3 } from "openapi-types";
export type FormContext = {
    schema?: JSONSchema7;
    servers?: OpenAPIV3.ServerObject[];
    parameters?: OpenAPIV3.ParameterObject[];
    securitySchemes?: {
        [key: string]: OpenAPIV3.SecuritySchemeObject;
    } | undefined;
};
/** Resolves the body and all parameter schemas and merges them into a single schema
 *
 * Also resolves the to-be-used servers for the operation according to spec: https://learn.openapis.org/specification/servers.html#the-server-object
 *
 * When multiple servers arrays are specified at different levels for a given operation, only the lowest level one is taken into account.
 */
//# sourceMappingURL=FromContext.d.ts.map