import { notEmpty } from "from-anywhere";
/** Responds with the operations from an openapi document by looking in the paths and (next)-allowed methods
 *
 * The openapi is generic to allow for extensions (like ActionSchema)
 */
export const getOperations = (openapi, openapiId) => {
    const allowedMethods = [
        "get",
        "post",
        "put",
        "patch",
        "delete",
        "head",
        "options",
    ];
    // TODO: we need the operations including all references. we're loosing components here!!!
    const operations = Object.keys(openapi.paths)
        .map((path) => {
        const item = openapi.paths[path];
        if (!item) {
            return;
        }
        const methods = Object.keys(item).filter((method) => allowedMethods.includes(method));
        const pathMethods = methods.map((method) => {
            const operation = item[method];
            // Get it fully resolved from the openapi. Do some research to find this function
            const resolvedRequestBodySchema = {};
            // TODO: supply the parameters (item.parameters)
            return {
                openapiId,
                path,
                method,
                operation,
                resolvedRequestBodySchema,
                id: operation.operationId || path + "=" + method,
            };
        });
        return pathMethods;
    })
        .filter(notEmpty)
        .flat();
    return operations;
};
//# sourceMappingURL=getOperations.js.map