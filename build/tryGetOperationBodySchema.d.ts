import { JSONSchemaType } from "ajv";
import { OpenapiDocument, OpenapiOperationObject } from "./openapi-types.js";
export declare const tryGetOperationBodySchema: (openapi: OpenapiDocument, operation: OpenapiOperationObject, documentLocation?: string) => Promise<JSONSchemaType<any> | undefined>;
//# sourceMappingURL=tryGetOperationBodySchema.d.ts.map