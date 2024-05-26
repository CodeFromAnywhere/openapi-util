import { HttpMethodEnum, OpenapiDocument } from "./openapi-types.js";
import { FormContext } from "./FromContext.js";
export declare const getFormContextFromOpenapi: (context: {
    openapi?: OpenapiDocument;
    path: string;
    method: HttpMethodEnum;
    originUrl?: string;
}) => FormContext;
//# sourceMappingURL=getFormContextFromOpenapi.d.ts.map