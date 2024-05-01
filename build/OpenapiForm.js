import { jsx as _jsx } from "react/jsx-runtime";
import { getFormSchema } from "./getFormSchema.js";
/** Simple Openapi form */
export const OpenapiForm = async (props) => {
    const { openapiUri, method, path } = props;
    const result = await getFormSchema({ method, path, openapiUri });
    //1. server-component: use getFormSchema (async function)
    //2. client-component: the resolved JSON Schema can be input into <RSJF/> ()
    return _jsx("div", {});
};
//# sourceMappingURL=OpenapiForm.js.map