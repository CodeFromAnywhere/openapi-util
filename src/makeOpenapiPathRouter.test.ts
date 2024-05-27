// 1) test for urls with '-' and other url compatible stuff
import openapi from "./test-openapi.json";
import { makeOpenapiPathRouter } from "./makeOpenapiPathRouter";
import { OpenapiDocument } from "./openapi-types";

// test: slugs are url-compatible in the broadest sense
// https://stackoverflow.com/questions/695438/what-are-the-safe-characters-for-making-urls
const router = makeOpenapiPathRouter(openapi as OpenapiDocument);

console.log(router("/ai_grunneger.123_456~789/openapi.json"));
