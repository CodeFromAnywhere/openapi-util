import { Json, mergeObjectsArray, notEmpty } from "from-anywhere";
import { makeOpenapiPathRouter } from "../makeOpenapiPathRouter.js";
import {
  OpenapiDocument,
  OpenapiOperationObject,
  OpenapiPathItemObject,
} from "../openapi-types.js";
import { tryGetOperationBodySchema } from "../tryGetOperationBodySchema.js";
import { tryValidateSchema } from "../tryValidateSchema.js";
import { resolveReferenceOrContinue } from "./resolveReferenceOrContinue.js";
import { JSONSchemaType } from "ajv";

export const tryParseData = async (
  request: Request,
  isJsonContentType: boolean,
) => {
  try {
    return isJsonContentType ? await request.json() : request.body;
  } catch (e) {
    console.log("Couldn't parse JSON:", request.url);
    return;
  }
};
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
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };
  if (method === "options") {
    // preflight stuff
    return Response.json(
      { ok: true },
      {
        status: 200,
        headers: {
          ...defaultHeaders,
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    );
  }

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

  const pathItem = (openapi.paths as any)?.[
    match.path
  ] as OpenapiPathItemObject;

  const operation = pathItem?.[method as keyof typeof pathItem] as
    | OpenapiOperationObject
    | undefined;

  if (!operation) {
    return Response.json("Endpoint not found", {
      status: 404,
      headers: defaultHeaders,
    });
  }

  const parameters = pathItem.parameters || operation?.parameters;

  console.log({ parameters });

  const documentLocation = undefined;

  const resolvedParameters = parameters
    ? await Promise.all(
        parameters.map((parameter) => {
          return resolveReferenceOrContinue(
            parameter,
            openapi,
            documentLocation,
          );
        }),
      )
    : undefined;

  const headers = resolvedParameters
    ? mergeObjectsArray(
        resolvedParameters
          .filter((item) => item?.in === "header")
          .map((x) => {
            const value = request.headers.get(x!.name);
            console.log({ value });
            if (value === null) {
              // this could be a problem if it were required
              return;
            }
            return { [x!.name]: value };
          })
          .filter(notEmpty),
      )
    : undefined;

  // ?a=b&c=d becomes {a:b,c:d} but only if it's in the parameter spec
  const queryParams = resolvedParameters
    ? mergeObjectsArray(
        new URL(request.url).search
          .slice(1)
          .split("&")
          .map((x) => x.split("=") as [string, string | undefined])
          .filter((x) =>
            resolvedParameters?.find(
              (item) => item?.in === "query" && item.name === x[0],
            ),
          )
          .map((item) => {
            return { [item[0]]: item[1] };
          }),
      )
    : undefined;

  const schema = await tryGetOperationBodySchema(openapi, operation, "");
  const isJsonContentType =
    request.headers.get("content-type") === "application/json";

  if (schema && !isJsonContentType) {
    return Response.json(
      {
        isSuccessful: false,
        message: "Please add 'Content-Type: application/json' header",
      },
      {
        status: 422,
        headers: defaultHeaders,
      },
    );
  }

  const data = await tryParseData(request, isJsonContentType);

  // console.log({ data, headers });

  const errors = schema
    ? tryValidateSchema({ schema: schema as JSONSchemaType<any>, data })
    : undefined;

  // validate this schema and return early if it fails

  if (errors && errors.length > 0) {
    console.log({ errors });
    return Response.json(
      {
        isSuccessful: false,
        message:
          "Invalid Input\n\n" +
          errors
            .map((x) => x.instancePath + x.schemaPath + ": " + x.message)
            .join(" \n\n"),
        // errors,
      },
      {
        status: 422,
        headers: defaultHeaders,
      },
    );
  }

  const operationId =
    operation.operationId || match.path.slice(1) + "=" + method;

  const fn = functions[operationId];

  if (!fn) {
    return Response.json("Function not found", {
      status: 404,
      headers: defaultHeaders,
    });
  }

  const pathParams =
    Object.keys(match.context).length > 0 ? match.context : undefined;

  // TODO: add proper typing for this if we ever accept non-object bodies in our openapi spec
  const body =
    typeof data === "object" && !Array.isArray(data) && data !== null
      ? data
      : data === undefined
      ? undefined
      : { body: data };

  const context = { ...body, ...pathParams, ...queryParams, ...headers };

  // console.log({ parameters, resolvedParameters, headers, context });

  // valid! Let's execute.
  const resultJson = await fn(context);

  if (typeof resultJson === undefined) {
    return new Response("No response", { status: 404 });
  }

  return Response.json(resultJson, {
    status: 200,
    headers: defaultHeaders,
  });
};
