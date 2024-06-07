import { readJsonFile } from "from-anywhere/node";
import path from "path";
export const resolveResource = async (uri, document, documentLocation) => {
    if (uri === "") {
        // we're already there
        return document;
    }
    if (uri.startsWith("https://") || uri.startsWith("http://")) {
        // absolute url
        try {
            const json = await fetch(uri).then((res) => res.json());
            return json;
        }
        catch (e) {
            return;
        }
    }
    if (uri.startsWith("/")) {
        // absolute path
        const json = await readJsonFile(uri);
        if (json === null) {
            throw new Error("JSON Not found at " + uri);
        }
        return json;
    }
    // relative path
    const absolutePath = path.resolve(documentLocation, uri);
    const json = await readJsonFile(absolutePath);
    if (json === null) {
        throw new Error("JSON Not found at " + uri);
    }
    return json;
};
//# sourceMappingURL=resolveResource.js.map