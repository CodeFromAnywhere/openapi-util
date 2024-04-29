import { JSONSchemaType } from "ajv";
import { resolveReferenceOrContinue } from "./resolveReferenceOrContinue.js";
import {
  OpenapiDocument,
  OpenapiOperationObject,
  ReferenceObject,
} from "./openapi-types.js";

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
      ?.schema as JSONSchemaType<any> | ReferenceObject | undefined;
    const schema = await resolveReferenceOrContinue(
      schemaOrReference,
      openapi,
      documentLocation,
    );
    return schema as JSONSchemaType<any>;
  } catch (e) {
    console.log("tryGetOperationBodySchema", e);
    return;
  }
};
