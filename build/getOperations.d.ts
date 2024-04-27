import { OpenAPIV3 } from "openapi-types";
/** Responds with the operations from an openapi document by looking in the paths and (next)-allowed methods
 *
 * The openapi is generic to allow for extensions (like ActionSchema)
 */
export declare const getOperations: <T extends OpenAPIV3.Document<{}>>(openapi: T, openapiId?: string) => {
    openapiId: string | undefined;
    path: string;
    method: string;
    operation: {
        tags?: string[] | undefined;
        summary?: string | undefined;
        description?: string | undefined;
        externalDocs?: OpenAPIV3.ExternalDocumentationObject | undefined;
        operationId?: string | undefined;
        parameters?: (OpenAPIV3.ReferenceObject | OpenAPIV3.ParameterObject)[] | undefined;
        requestBody?: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject | undefined;
        responses: OpenAPIV3.ResponsesObject;
        callbacks?: {
            [callback: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.CallbackObject;
        } | undefined;
        deprecated?: boolean | undefined;
        security?: OpenAPIV3.SecurityRequirementObject[] | undefined;
        servers?: OpenAPIV3.ServerObject[] | undefined;
    };
    resolvedRequestBodySchema: OpenAPIV3.NonArraySchemaObject;
    id: string;
}[];
//# sourceMappingURL=getOperations.d.ts.map