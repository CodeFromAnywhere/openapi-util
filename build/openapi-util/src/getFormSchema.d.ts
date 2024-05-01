import { HttpMethods, OpenapiDocument } from "./openapi-types.js";
import openapi from "../../opencrud/public/openapi.json";
/** Resolves the body and all parameter schemas */
export declare const getFormSchema: (context: {
    openapi: OpenapiDocument;
    path: string;
    method: HttpMethods;
    openapiUrl: string;
}) => Promise<import("@apidevtools/json-schema-ref-parser").JSONSchema | undefined>;
export type HttpMethodEnum = "get" | "put" | "post" | "delete" | "options" | "head" | "patch" | "trace";
export type OperationPartial = {
    responses: {
        "200": {
            content: {
                "application/json": {
                    schema: any;
                };
            };
        };
    };
};
/** Typesafe openapi form - works with local JSON files.
 *
 * TODO: Use below typing for getFormSchema.
 */
export declare const OpenapiForm: <T extends {
    paths: {
        [key: string]: {
            get?: OperationPartial | undefined;
            put?: OperationPartial | undefined;
            post?: OperationPartial | undefined;
            delete?: OperationPartial | undefined;
            options?: OperationPartial | undefined;
            head?: OperationPartial | undefined;
            patch?: OperationPartial | undefined;
            trace?: OperationPartial | undefined;
        };
    };
}, P extends keyof T["paths"], M extends keyof T["paths"][P] & HttpMethodEnum>(props: {
    openapi: T;
    path: P;
    method: M;
    withResult: (result: T["paths"][P][M] extends OperationPartial ? T["paths"][P][M]["responses"]["200"]["content"]["application/json"]["schema"] : never) => void;
}) => any;
export declare const RenderTest: () => any;
//# sourceMappingURL=getFormSchema.d.ts.map