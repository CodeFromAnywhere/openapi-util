import { FormContext } from "./FromContext.js";
import { getFormContextFromOpenapi } from "./getFormContextFromOpenapi.js";
import { HttpMethodEnum, OpenapiDocument } from "./openapi-types.js";
import { resolveSchemaRecursive } from "./resolveSchemaRecursive.js";

export const getFormContext = async (context: {
  openapiUri: string;
  path: string;
  method: HttpMethodEnum;
}): Promise<FormContext> => {
  const { method, openapiUri, path } = context;

  const originUrl = URL.canParse(openapiUri)
    ? new URL(openapiUri).origin
    : undefined;

  const openapi = (await resolveSchemaRecursive({
    documentUri: openapiUri,
    shouldDereference: true,
  })) as OpenapiDocument | undefined;

  return getFormContextFromOpenapi({ openapi, method, path, originUrl });
};
/* TEST:
getFormSchema({
  openapiUri: "/Users/king/Desktop/github/opencrud/public/openapi.json",
  path: "/root/createDatabase",
  method: "post",
}).then(console.log);
*/
