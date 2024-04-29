import { Json, mergeObjectsArray } from "from-anywhere";
import { makeOpenapiPathRouter } from "./makeOpenapiPathRouter.js";
import { OpenapiDocument, OpenapiOperationObject } from "./openapi-types.js";
import { tryGetOperationBodySchema } from "./tryGetOperationBodySchema.js";
import { tryValidateSchema } from "./tryValidateSchema.js";

/**
 * Function that turns a regular function into an endpoint. If the function is available in the OpenAPI (with function name equalling the operationId), the input will be validated.
 *
 * NB: You can use this anywhere you want your openapi to be available. Usually it's in a catch-all route, but you can also use other next routing in case you need to have pages in some cases.
 */
export const resolveOpenapiAppRequest = async (
  request: Request,
  method: string,
  config: {
    openapi: OpenapiDocument;
    functions: {
      [functionName: string]: (jsonBody: any) => any | Promise<any>;
    };
  },
) => {
  const { functions, openapi } = config;
  const defaultHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    // "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  const url = request.url;
  const urlObject = new URL(url);
  const requestPathname = urlObject.pathname;
  // basePath may depend on openapi server

  const serverUrl = openapi.servers?.[0]?.url || urlObject.origin;
  const serverBasePathname = new URL(serverUrl).pathname;

  const restPathname = "/" + requestPathname.slice(serverBasePathname.length);

  const router = makeOpenapiPathRouter(openapi);

  const match = router(restPathname);

  if (!match) {
    const allowedMethods = [
      "get",
      "post",
      "put",
      "patch",
      "delete",
      "head",
      "options",
    ];
    const methods = mergeObjectsArray(
      Object.keys(openapi.paths).map((path) => {
        return {
          [path]: Object.keys((openapi as any).paths[path]).filter((method) =>
            allowedMethods.includes(method),
          ),
        };
      }),
    );

    return Response.json(
      {
        message: `Invalid method.`,
        methods,
        restPathname,
      },
      {
        status: 404,
        headers: defaultHeaders,
      },
    );
  }

  const operation = (openapi.paths as any)?.[match.path]?.[method] as
    | OpenapiOperationObject
    | undefined;

  if (!operation) {
    return Response.json("Endpoint not found", {
      status: 404,
      headers: defaultHeaders,
    });
  }

  const schema = await tryGetOperationBodySchema(openapi, operation);

  if (!schema) {
    return Response.json("Schema not found", {
      status: 404,
      headers: defaultHeaders,
    });
  }

  if (request.headers.get("content-type") !== "application/json") {
    return Response.json(
      {
        isSuccessful: false,
        message: "Please specify content-type header to be application/json",
      },
      {
        status: 422,
        headers: defaultHeaders,
      },
    );
  }

  const data = request.body as Json;

  const errors = tryValidateSchema({ schema, data });
  // validate this schema and return early if it fails

  if (errors && errors.length > 0) {
    return Response.json(
      {
        isSuccessful: false,
        message:
          "Invalid Input\n\n" +
          errors.map((x) => x.instancePath + ": " + x.message).join(" \n\n"),
        // errors,
      },
      {
        status: 422,
        headers: defaultHeaders,
      },
    );
  }

  const operationId = operation.operationId || match.path + "=" + method;

  const fn = functions[operationId];

  if (!fn) {
    return Response.json("Function not found", {
      status: 404,
      headers: defaultHeaders,
    });
  }

  const context =
    Object.keys(match.context).length > 0 &&
    typeof data === "object" &&
    data !== null
      ? { ...data, ...match.context }
      : data;

  // valid! Let's execute.
  const resultJson = await fn(context);

  return Response.json(resultJson, {
    status: 200,
    headers: defaultHeaders,
  });
};
