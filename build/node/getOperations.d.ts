import { OpenAPIV3 } from "openapi-types";
/**
 * Responds with the operations from an openapi document by looking in the paths and (next)-allowed methods
 *
 * TODO: Ensure `getOperations` resolves every `component/schemas` and remote ones. Maybe it's possible to do with some redocly function (or continue from `resolveResource`)
 */
export declare const getOperations: (openapi: OpenAPIV3.Document, openapiId?: string, documentLocation?: string) => Promise<{
    openapiId: string | undefined;
    path: string;
    method: string;
    operation: {
        tags?: string[] | undefined;
        summary?: string | undefined;
        description?: string | undefined;
        externalDocs?: OpenAPIV3.ExternalDocumentationObject | undefined;
        operationId?: string | undefined;
        parameters?: (OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject)[] | undefined;
        requestBody?: OpenAPIV3.ReferenceObject | OpenAPIV3.RequestBodyObject | undefined;
        responses: OpenAPIV3.ResponsesObject;
        callbacks?: {
            [callback: string]: OpenAPIV3.ReferenceObject | OpenAPIV3.CallbackObject;
        } | undefined;
        deprecated?: boolean | undefined;
        security?: OpenAPIV3.SecurityRequirementObject[] | undefined;
        servers?: OpenAPIV3.ServerObject[] | undefined;
    };
    parameters: (OpenAPIV3.ParameterObject | OpenAPIV3.ReferenceObject)[] | undefined;
    resolvedRequestBodySchema: OpenAPIV3.SchemaObject | undefined;
    id: string;
}[] | undefined>;
//# sourceMappingURL=getOperations.d.ts.map