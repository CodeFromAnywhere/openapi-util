import { mergeObjectsArray, notEmpty, removeOptionalKeysFromObjectStrings, } from "from-anywhere";
import qs from "qs";
/**
 * Fills headers, path, query, cookies, and body into a fetch in the right way according to the spec.
 *
 * Returns an executed fetch-call
 *
 * NB: I'm not following the security spec perfectly yet, nor is any frontend validation happening. Let's do this at a later stage.
 */
export const submitOperation = (context) => {
    const { data, method, path, servers, parameters, securitySchemes } = context;
    const securityArray = securitySchemes ? Object.values(securitySchemes) : [];
    const basicHttp = securityArray.find((item) => item.type === "http" && item.scheme === "basic");
    const basicBearer = securityArray.find((item) => item.type === "http" && item.scheme === "bearer");
    const apiKeySecurity = securityArray.find((item) => item.type === "apiKey");
    const authHeader = basicHttp
        ? {
            Authorization: `Basic ${btoa(`${data.httpBasicUsername}:${data.httpBasicPassword}`)}`,
        }
        : basicBearer
            ? { Authorization: `Bearer ${data.httpBearerToken}` }
            : apiKeySecurity && apiKeySecurity.in === "header"
                ? { [apiKeySecurity.name]: data[apiKeySecurity.name] }
                : undefined;
    const firstServerUrl = servers?.find((x) => x.url)?.url || "";
    const queryParameters = parameters
        ? parameters.filter((x) => x.in === "query")
        : [];
    const queryString = qs.stringify(mergeObjectsArray(queryParameters
        .map((x) => x.name)
        .map((name) => {
        return { [name]: data[name] };
    })));
    const queryPart = queryString === "" ? "" : "?" + queryString;
    const pathParameters = parameters
        ? parameters.filter((x) => x.in === "path")
        : [];
    const realPath = pathParameters.reduce((path, parameter) => {
        return path.replaceAll(`{${parameter.name}}`, data[parameter.name]);
    }, path);
    const headerParameters = parameters
        ? parameters.filter((x) => x.in === "header")
        : [];
    const bodyData = parameters
        ? removeOptionalKeysFromObjectStrings(data, parameters.map((x) => x.name))
        : data;
    const hasBody = Object.keys(bodyData).length > 0;
    const body = hasBody ? JSON.stringify(bodyData) : undefined;
    const allHeaders = [authHeader]
        .concat(headerParameters.map((item) => ({ [item.name]: data[item.name] })))
        .concat(hasBody ? [{ "Content-Type": "application/json" }] : undefined)
        .filter(notEmpty);
    const headers = mergeObjectsArray(allHeaders);
    console.log("YOYO", { headers, body });
    const url = firstServerUrl + realPath + queryPart;
    const fetchRequestInit = { body, headers, method };
    return fetch(url, fetchRequestInit);
};
//# sourceMappingURL=submitOperation.js.map