import $RefParser from "@apidevtools/json-schema-ref-parser";
/**
 * Will resolve all external references recursively to end up with a schema without references (or only internal references)
 *
 * Uses https://github.com/APIDevTools/json-schema-ref-parser
 *
 * Returns the document without references in the schemas.
 */
export const resolveSchemaRecursive = async (context) => {
    const { document, documentUri, shouldDereference } = context;
    const fn = shouldDereference ? $RefParser.dereference : $RefParser.bundle;
    try {
        const result = await fn(documentUri || document, {
            continueOnError: true,
            mutateInputSchema: false,
            resolve: { external: true },
        });
        return result;
    }
    catch (err) {
        console.error(err);
        return;
    }
    // Just like simplifySchema:
    //
    // 1) if it's a ref that isn't circular, look it up
    // 2) boolean,integer,number,null,string: keep it
    // 3) array: look into items, additionalItems
    // 4) object: recurse into properties, patternProperties, additionalProperties, dependencies, propertyNames
    // 5) copy and recurse: allOf, oneOf, anyOf, not, if, then, else
    // definitions can contain more stuff but that's always internal.
};
/* test:
let p =
  "https://raw.githubusercontent.com/CodeFromAnywhere/ActionSchema/main/schemas/openapi-proxy.schema.json";
resolveSchemaRecursive({ document: p }).then((res) => {
  console.log({ res });
});
*/
resolveSchemaRecursive({
    documentUri: "/Users/king/Desktop/github/opencrud/public/openapi.json",
});
//# sourceMappingURL=resolveSchemaRecursive.js.map