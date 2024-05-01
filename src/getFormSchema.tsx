import { JSONSchema7 } from "json-schema";
import {
  HttpMethodEnum,
  OpenapiDocument,
  OpenapiParameterObject,
} from "./openapi-types.js";
import { resolveSchemaRecursive } from "./resolveSchemaRecursive.js";

/** Resolves the body and all parameter schemas and merges them into a single schema
 *
 * Also resolves the to-be-used servers for the operation according to spec: https://learn.openapis.org/specification/servers.html#the-server-object
 *
 * When multiple servers arrays are specified at different levels for a given operation, only the lowest level one is taken into account.
 */
export const getFormSchema = async (context: {
  openapiUri: string;
  path: string;
  method: HttpMethodEnum;
}) => {
  const { method, openapiUri, path } = context;
  const openapi = (await resolveSchemaRecursive({
    documentUri: openapiUri,
    shouldDereference: true,
  })) as OpenapiDocument | undefined;

  if (!openapi) {
    return { servers: [], schema: undefined };
  }

  const pathItem = openapi.paths[path as keyof typeof openapi.paths];
  const operation = pathItem?.[method];
  if (!operation) {
    return { servers: [], schema: undefined };
  }

  //MERGE according to spec:
  const servers = operation.servers?.length
    ? operation.servers
    : pathItem.servers?.length
    ? pathItem.servers
    : openapi.servers;

  const originUrl = URL.canParse(openapiUri)
    ? new URL(openapiUri).origin
    : undefined;

  const serversWithUrl = servers?.filter((x) => !!x.url);
  const serversWithBaseServer =
    serversWithUrl && serversWithUrl.length > 0
      ? serversWithUrl
      : originUrl
      ? [{ url: originUrl }]
      : [];

  const serversWithOrigin = serversWithBaseServer.map((server) => {
    const fullUrl = URL.canParse(server.url)
      ? server.url
      : (originUrl || "") + server.url;

    return { ...server, url: fullUrl };
  });

  const parameters = (pathItem?.parameters ||
    operation?.parameters) as OpenapiParameterObject[];

  const bodySchema = (operation as any).requestBody?.content?.[
    "application/json"
  ]?.schema as JSONSchema7 | undefined;

  if (!bodySchema) {
    return { servers: serversWithOrigin, schema: undefined };
  }

  const parameterSchemas = parameters.map(
    (item) =>
      ({
        type: "object",
        required: item.required ? [item.name] : undefined,
        properties: { [item.name]: item.schema as JSONSchema7 },
      } as JSONSchema7),
  );

  const allSchemas = parameterSchemas.concat(bodySchema);

  const mergedSchema = allSchemas.reduce(
    (accumulator, next) => {
      return {
        ...accumulator,
        properties: { ...accumulator.properties, ...next.properties },
        required: (accumulator.required || []).concat(next.required || []),
      };
    },
    {
      type: "object",
      properties: {},
      required: [],
    } as JSONSchema7,
  );

  return { schema: mergedSchema, servers: serversWithOrigin, parameters };
};
/* TEST:
getFormSchema({
  openapiUri: "/Users/king/Desktop/github/opencrud/public/openapi.json",
  path: "/root/createDatabase",
  method: "post",
}).then(console.log);
*/
