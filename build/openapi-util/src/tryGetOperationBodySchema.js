import { resolveReferenceOrContinue } from "./resolveReferenceOrContinue.js";
export const tryGetOperationBodySchema = async (openapi, operation, documentLocation) => {
    if (!operation.requestBody) {
        return;
    }
    try {
        const requestBody = await resolveReferenceOrContinue(operation.requestBody, openapi, documentLocation);
        const schemaOrReference = requestBody?.content?.["application/json"]
            ?.schema;
        const schema = await resolveReferenceOrContinue(schemaOrReference, openapi, documentLocation);
        return schema;
    }
    catch (e) {
        console.log("tryGetOperationBodySchema", e);
        return;
    }
};
//# sourceMappingURL=tryGetOperationBodySchema.js.map