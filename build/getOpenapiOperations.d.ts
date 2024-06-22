import { OpenapiOperationObject, OpenapiSchemaObject } from "from-anywhere";
import { OpenAPIV3 } from "openapi-types";
import { HttpMethodEnum, OpenapiDocument } from "./openapi-types.js";
export type OpenapiDetails = {
    openapiId: string;
    openapiUrl: string;
    operations: OperationDetails[];
    document: OpenapiDocument;
    tags: OpenAPIV3.TagObject[];
};
export type OperationDetails = {
    /** either the operationId or path=method */
    id: string;
    openapiId: string;
    path: string;
    method: HttpMethodEnum;
    operation: OpenapiOperationObject;
    /** Can be added for convienience. Must resolve al references from the openapi */
    resolvedRequestBodySchema: OpenapiSchemaObject;
};
export declare const getOpenapiOperations: (openapiId: string, openapiUrl: string | undefined) => Promise<OpenapiDetails | undefined>;
//# sourceMappingURL=getOpenapiOperations.d.ts.map