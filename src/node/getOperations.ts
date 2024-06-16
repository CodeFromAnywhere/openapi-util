import { notEmpty } from "from-anywhere";
import { OpenAPIV3 } from "openapi-types";
import { resolveSchemaRecursive } from "../resolveSchemaRecursive.js";
import { OpenapiDocument } from "../openapi-types.js";

/**
 * Responds with the operations from an openapi document by looking in the paths and (next)-allowed methods
 *
 * TODO:Ensure `getOperations` resolves every `component/schemas` and remote ones. Maybe it's possible to do with some redocly function (or continue from `resolveResource`)
 */
export const getOperations = async (
  openapi: OpenAPIV3.Document,
  openapiId?: string,
  documentLocation?: string,
) => {
  const resolved = (await resolveSchemaRecursive({
    documentUri: documentLocation,
    document: openapi,
    shouldDereference: true,
  })) as OpenapiDocument | undefined;

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

  const operations = (
    await Promise.all(
      Object.keys(resolved.paths).map(async (path) => {
        const item: OpenAPIV3.PathItemObject | undefined =
          resolved.paths![path as keyof typeof resolved.paths];

        if (!item) {
          return;
        }

        const methods = Object.keys(item).filter((method) =>
          allowedMethods.includes(method),
        );

        const pathMethods = await Promise.all(
          methods.map(async (method) => {
            const operation = item[
              method as keyof typeof item
            ] as OpenAPIV3.OperationObject;

            const parameters = operation.parameters || item.parameters;

            const resolvedRequestBodySchema = (
              operation.requestBody as OpenAPIV3.RequestBodyObject
            )?.content?.["application/json"].schema as
              | OpenAPIV3.SchemaObject
              | undefined;

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
          }),
        );

        return pathMethods;
      }),
    )
  )
    .filter(notEmpty)
    .flat();

  return operations;
};
