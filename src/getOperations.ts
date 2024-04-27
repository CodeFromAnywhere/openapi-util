import { notEmpty } from "from-anywhere";
import { OpenAPIV3 } from "openapi-types";
import {
  OpenapiOperationObject,
  OpenapiSchemaObject,
} from "./openapi-types.js";

/** Responds with the operations from an openapi document by looking in the paths and (next)-allowed methods
 *
 * The openapi is generic to allow for extensions (like ActionSchema)
 */
export const getOperations = <T extends OpenAPIV3.Document>(
  openapi: T,
  openapiId?: string,
) => {
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
      const item = openapi.paths![
        path as keyof typeof openapi.paths
      ] as OpenAPIV3.Document["paths"][string];

      if (!item) {
        return;
      }

      const methods = Object.keys(item).filter((method) =>
        allowedMethods.includes(method),
      );
      const pathMethods = methods.map((method) => {
        const operation = item[
          method as keyof typeof item
        ] as OpenapiOperationObject;

        // Get it fully resolved from the openapi. Do some research to find this function
        const resolvedRequestBodySchema: OpenapiSchemaObject = {};

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
