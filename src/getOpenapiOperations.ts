import {
  OpenapiOperationObject,
  OpenapiSchemaObject,
  notEmpty,
  onlyUnique2,
} from "from-anywhere";

import { fetchOpenapi } from "./fetchOpenapi.js";
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

export const getOpenapiOperations = async (
  openapiId: string,
  openapiUrl: string | undefined,
): Promise<OpenapiDetails | undefined> => {
  if (!openapiUrl) {
    return;
  }
  const openapi = await fetchOpenapi(openapiUrl);

  if (!openapi?.paths) {
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

  const operations = Object.keys(openapi.paths)
    .map((path) => {
      const item = openapi.paths![path as keyof typeof openapi.paths];
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

        return {
          openapiId,
          path,
          method: method as HttpMethodEnum,
          operation,
          resolvedRequestBodySchema,
          id: operation.operationId || path.slice(1) + "=" + method,
        };
      });

      return pathMethods;
    })
    .filter(notEmpty)
    .flat();

  const tags = openapi.tags?.length
    ? openapi.tags
    : operations
        .map((item) => item.operation.tags)
        .filter(notEmpty)
        .flat()
        .filter(onlyUnique2())
        .map((name) => ({ name } as OpenAPIV3.TagObject));

  //@ts-ignore
  return { openapiId, operations, document: openapi, openapiUrl, tags };
};
