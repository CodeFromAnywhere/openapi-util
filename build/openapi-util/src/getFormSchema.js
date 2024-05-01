import { jsx as _jsx } from "react/jsx-runtime";
import { resolveReferenceOrContinue } from "./resolveReferenceOrContinue";
import { resolveSchemaRecursive } from "./resolveSchemaRecursive.js";
import { tryGetOperationBodySchema } from "./tryGetOperationBodySchema.js";
//TODO: This is just to test
import openapi from "../../opencrud/public/openapi.json";
/** Resolves the body and all parameter schemas */
export const getFormSchema = async (context) => {
    const { method, openapi, openapiUrl, path } = context;
    const resolvedSchema = await resolveSchemaRecursive({
        documentUri: `${openapiUrl}`, //#/paths/${path}/${method}`,
    });
    const pathItem = openapi.paths[path];
    const operation = pathItem?.[method];
    const parameters = pathItem?.parameters || operation?.parameters;
    const resolvedParameters = parameters
        ? await Promise.all(parameters.map((item) => resolveReferenceOrContinue(item, openapi)))
        : [];
    if (!operation) {
        return;
    }
    const bodySchema = await tryGetOperationBodySchema(openapi, operation);
    if (!bodySchema) {
        return;
    }
    const parameterSchemas = resolvedParameters.map((item) => ({
        type: "object",
        required: item.required ? [item.name] : undefined,
        properties: { [item.name]: item.schema },
    }));
    const allSchemas = parameterSchemas.concat(bodySchema);
    const mergedSchema = allSchemas.reduce((accumulator, next) => {
        return {
            ...accumulator,
            properties: { ...accumulator.properties, ...next.properties },
            required: (accumulator.required || []).concat(next.required || []),
        };
    }, {
        type: "object",
        properties: {},
        required: [],
    });
    return resolvedSchema;
};
/** Typesafe openapi form - works with local JSON files.
 *
 * TODO: Use below typing for getFormSchema.
 */
export const OpenapiForm = (props) => {
    //1. server-component: use getFormSchema (async function)
    //2. client-component: the resolved JSON Schema can be input into <RSJF/> ()
    return _jsx("div", {});
};
export const RenderTest = () => {
    return (_jsx(OpenapiForm, { openapi: openapi, path: "/root/createDatabase", method: "post", withResult: (res) => { } }));
};
//# sourceMappingURL=getFormSchema.js.map