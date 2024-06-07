import { notEmpty } from "from-anywhere";
import { resolveReferenceOrContinue } from "./resolveReferenceOrContinue.js";
/**
 * Responds with the operations from an openapi document by looking in the paths and (next)-allowed methods
 *
 * TODO:Ensure `getOperations` resolves every `component/schemas` and remote ones. Maybe it's possible to do with some redocly function (or continue from `resolveResource`)
 */
export const getOperations = async (openapi, openapiId, documentLocation) => {
    const allowedMethods = [
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "head",
        "options",
    ];
    const operations = (await Promise.all(Object.keys(openapi.paths).map(async (path) => {
        const item = openapi.paths[path];
        if (!item) {
            return;
        }
        const methods = Object.keys(item).filter((method) => allowedMethods.includes(method));
        const pathMethods = await Promise.all(methods.map(async (method) => {
            const operation = item[method];
            // TODO: Get them resolved
            const parameters = operation.parameters || item.parameters;
            const schema = await resolveReferenceOrContinue((await resolveReferenceOrContinue(operation.requestBody, openapi, documentLocation)).content["application/json"].schema, openapi, documentLocation);
            // TODO: Get it fully resolved from the openapi. Do some research to find this function
            const resolvedRequestBodySchema = schema;
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