import { notEmpty } from "from-anywhere";
import { JSONSchema7 } from "json-schema";
import { OpenAPIV3 } from "openapi-types";
import {
  HttpMethodEnum,
  OpenapiDocument,
  OpenapiParameterObject,
} from "./openapi-types.js";
import { FormContext } from "./FromContext.js";

export const getFormContextFromOpenapi = (context: {
  openapi?: OpenapiDocument;
  path: string;
  method: HttpMethodEnum;
  originUrl?: string;
}): FormContext => {
  const { openapi, path, method, originUrl } = context;

  if (!openapi) {
    return { servers: [], schema: undefined };
  }

  const pathItem = openapi.paths[path as keyof typeof openapi.paths];
  const operation = pathItem?.[method];

  if (!operation) {
    return { servers: [], schema: undefined };
  }
  const securitySchemes = openapi.components?.securitySchemes as
    | {
        [key: string]: OpenAPIV3.SecuritySchemeObject;
      }
    | undefined;

  //MERGE according to spec:
  const servers = operation.servers?.length
    ? operation.servers
    : pathItem.servers?.length
    ? pathItem.servers
    : openapi.servers;

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

  const parameters = (pathItem?.parameters || operation?.parameters) as
    | OpenapiParameterObject[]
    | undefined;

  const bodySchema = (operation as any).requestBody?.content?.[
    "application/json"
  ]?.schema as JSONSchema7 | undefined;

  const parameterSchemas = (parameters || []).map(
    (item) =>
      ({
        type: "object",
        required: item.required ? [item.name] : undefined,
        properties: { [item.name]: item.schema as JSONSchema7 },
      } as JSONSchema7 | undefined),
  );

  const securitySchemas = securitySchemes
    ? (Object.values(securitySchemes).map((item) => {
        if (item.type === "apiKey") {
          const schema: JSONSchema7 = {
            type: "object",
            properties: {
              [item.name]: { type: "string" },
            },
          };
          return schema;
        }

        if (item.type === "http") {
          if (item.scheme === "basic") {
            const schema: JSONSchema7 = {
              type: "object",
              properties: {
                httpBasicUsername: { type: "string" },
                httpBasicPassword: { type: "string" },
              },
            };
            return schema;
          }

          if (item.scheme === "bearer") {
            const schema: JSONSchema7 = {
              type: "object",
              properties: { httpBearerToken: { type: "string" } },
            };
            return schema;
          }

          const schema: JSONSchema7 = {
            type: "object",
            properties: {
              httpAuth: {
                type: "string",
                description: `Unknown http auth: scheme=${item.scheme}`,
              },
            },
          };
          return schema;
        }

        if (item.type === "oauth2") {
          const schema: JSONSchema7 = {
            type: "object",
            properties: {
              oauth2: { type: "string", description: "Not implemented yet" },
            },
          };
          return schema;
        }

        if (item.type === "openIdConnect") {
          const schema: JSONSchema7 = {
            type: "object",
            properties: {
              openIdConnect: {
                type: "string",
                description: "Not implemented yet",
              },
            },
          };
          return schema;
        }

        const schema: JSONSchema7 = {
          type: "object",
          properties: {
            unknownSecurity: {
              type: "string",
              description: `Unknown security: ${(item as any)?.type}`,
            },
          },
        };
        return schema;
      }) as (JSONSchema7 | undefined)[])
    : [];

  const allSchemas = [bodySchema]
    .concat(securitySchemas)
    .concat(parameterSchemas)
    .filter(notEmpty);

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

  return {
    schema: mergedSchema,
    servers: serversWithOrigin,
    parameters,
    securitySchemes,
  };
};
