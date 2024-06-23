import { notEmpty } from "from-anywhere";
import { resolveSchemaRecursive } from "../resolveSchemaRecursive.js";
/**
 * Responds with the operations from an openapi document by looking in the paths and (next)-allowed methods
 *
 * TODO: Ensure `getOperations` resolves every `component/schemas` and remote ones. Maybe it's possible to do with some redocly function (or continue from `resolveResource`)
 */
export const getOperations = async (openapi, openapiId, documentLocation) => {
    const resolved = (await resolveSchemaRecursive({
        documentUri: documentLocation,
        document: openapi,
        shouldDereference: true,
    }));
    if (!resolved) {
        return;
    }
    const allowedMethods = [
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "head",
        "options",
    ];
    const operations = (await Promise.all(Object.keys(resolved.paths).map(async (path) => {
        const item = resolved.paths[path];
        if (!item) {
            return;
        }
        const methods = Object.keys(item).filter((method) => allowedMethods.includes(method));
        const pathMethods = await Promise.all(methods.map(async (method) => {
            const operation = item[method];
            const parameters = operation.parameters || item.parameters;
            const resolvedRequestBodySchema = operation.requestBody?.content?.["application/json"].schema;
            const id = operation.operationId || path.slice(1) + "=" + method;
            return {
                openapiId,
                path,
                method: method,
                operation,
                parameters,
                resolvedRequestBodySchema,
                id,
            };
        }));
        return pathMethods;
    })))
        .filter(notEmpty)
        .flat();
    return operations;
};
//# sourceMappingURL=getOperations.js.map