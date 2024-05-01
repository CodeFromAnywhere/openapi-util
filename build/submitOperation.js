import { mergeObjectsArray, removeOptionalKeysFromObjectStrings, } from "from-anywhere";
import qs from "qs";
/**
 * Fills headers, path, query, cookies, and body into a fetch in the right way according to the spec.
 *
 * Returns an executed fetch-call */
export const submitOperation = (context) => {
    const { data, method, path, servers, parameters } = context;
    const firstServerUrl = servers?.find((x) => x.url)?.url;
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
    const headers = mergeObjectsArray(headerParameters.map((item) => ({ [item.name]: data[item.name] })));
    const bodyData = parameters
        ? removeOptionalKeysFromObjectStrings(data, parameters.map((x) => x.name))
        : data;
    const body = Object.keys(bodyData).length > 0 ? JSON.stringify(bodyData) : undefined;
    const url = firstServerUrl + realPath + queryPart;
    const fetchRequestInit = { body, headers, method };
    return fetch(url, fetchRequestInit);
};
//# sourceMappingURL=submitOperation.js.map