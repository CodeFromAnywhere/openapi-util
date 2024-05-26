import { notEmpty } from "from-anywhere";
export const getFormContextFromOpenapi = (context) => {
    const { openapi, path, method, originUrl } = context;
    if (!openapi) {
        return { servers: [], schema: undefined };
    }
    const pathItem = openapi.paths[path];
    const operation = pathItem?.[method];
    if (!operation) {
        return { servers: [], schema: undefined };
    }
    const securitySchemes = openapi.components?.securitySchemes;
    //MERGE according to spec:
    const servers = operation.servers?.length
        ? operation.servers
        : pathItem.servers?.length
            ? pathItem.servers
            : openapi.servers;
    const serversWithUrl = servers?.filter((x) => !!x.url);
    const serversWithBaseServer = serversWithUrl && serversWithUrl.length > 0
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
    const parameters = (pathItem?.parameters || operation?.parameters);
    const bodySchema = operation.requestBody?.content?.["application/json"]?.schema;
    const parameterSchemas = (parameters || []).map((item) => ({
        type: "object",
        required: item.required ? [item.name] : undefined,
        properties: { [item.name]: item.schema },
    }));
    const securitySchemas = securitySchemes
        ? Object.values(securitySchemes).map((item) => {
            if (item.type === "apiKey") {
                const schema = {
                    type: "object",
                    properties: {
                        [item.name]: { type: "string" },
                    },
                };
                return schema;
            }
            if (item.type === "http") {
                if (item.scheme === "basic") {
                    const schema = {
                        type: "object",
                        properties: {
                            httpBasicUsername: { type: "string" },
                            httpBasicPassword: { type: "string" },
                        },
                    };
                    return schema;
                }
                if (item.scheme === "bearer") {
                    const schema = {
                        type: "object",
                        properties: { httpBearerToken: { type: "string" } },
                    };
                    return schema;
                }
                const schema = {
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
                const schema = {
                    type: "object",
                    properties: {
                        oauth2: { type: "string", description: "Not implemented yet" },
                    },
                };
                return schema;
            }
            if (item.type === "openIdConnect") {
                const schema = {
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
            const schema = {
                type: "object",
                properties: {
                    unknownSecurity: {
                        type: "string",
                        description: `Unknown security: ${item?.type}`,
                    },
                },
            };
            return schema;
        })
        : [];
    const allSchemas = [bodySchema]
        .concat(securitySchemas)
        .concat(parameterSchemas)
        .filter(notEmpty);
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
    return {
        schema: mergedSchema,
        servers: serversWithOrigin,
        parameters,
        securitySchemes,
    };
};
//# sourceMappingURL=getFormContextFromOpenapi.js.map