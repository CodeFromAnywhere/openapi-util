import { getFormContextFromOpenapi } from "./getFormContextFromOpenapi.js";
import { resolveSchemaRecursive } from "./resolveSchemaRecursive.js";
export const getFormContext = async (context) => {
    const { method, openapiUri, path } = context;
    const originUrl = URL.canParse(openapiUri)
        ? new URL(openapiUri).origin
        : undefined;
    const openapi = (await resolveSchemaRecursive({
        documentUri: openapiUri,
        shouldDereference: true,
    }));
    return getFormContextFromOpenapi({ openapi, method, path, originUrl });
};
/* TEST:
getFormSchema({
  openapiUri: "/Users/king/Desktop/github/opencrud/public/openapi.json",
  path: "/root/createDatabase",
  method: "post",
}).then(console.log);
*/
//# sourceMappingURL=getFormContext.js.map