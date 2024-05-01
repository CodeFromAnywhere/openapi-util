import { O } from "from-anywhere";
/**
 * Will resolve all external references recursively to end up with a schema without references (or only internal references)
 *
 * Uses https://github.com/APIDevTools/json-schema-ref-parser
 */
export declare const resolveSchemaRecursive: (context: {
    /** If you want the thing to resolve relative files, we need to provide an URL or absolute path here (see https://github.com/APIDevTools/json-schema-ref-parser/issues/339) */
    documentUri?: string;
    /** If you don't need relative resolving, you can provide a document directly. */
    document?: O;
    /** If true, the final schema will not contain any references anymore,
     *
     * (but it will not remove the original definitons or components/schemas). */
    shouldDereference?: boolean;
}) => Promise<import("@apidevtools/json-schema-ref-parser").JSONSchema | undefined>;
//# sourceMappingURL=resolveSchemaRecursive.d.ts.map