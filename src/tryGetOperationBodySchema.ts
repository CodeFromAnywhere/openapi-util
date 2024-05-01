import { resolveReferenceOrContinue } from "./resolveReferenceOrContinue.js";
import {
  OpenapiDocument,
  OpenapiOperationObject,
  ReferenceObject,
} from "./openapi-types.js";
import { JSONSchema7 } from "json-schema";

export const tryGetOperationBodySchema = async (
  openapi: OpenapiDocument,
  operation: OpenapiOperationObject,
  documentLocation?: string,
) => {
  if (!operation.requestBody) {
    return;
  }
  try {
    const requestBody = await resolveReferenceOrContinue(
      operation.requestBody,
      openapi,
      documentLocation,
    );

    const schemaOrReference = requestBody?.content?.["application/json"]
      ?.schema as JSONSchema7 | ReferenceObject | undefined;
    const schema = await resolveReferenceOrContinue(
      schemaOrReference,
      openapi,
      documentLocation,
    );
    return schema as JSONSchema7;
  } catch (e) {
    console.log("tryGetOperationBodySchema", e);
    return;
  }
};
