import { fromJson } from "@bufbuild/protobuf";
import crypto from "crypto";
import {
  type IntegrationEventJob,
  IntegrationEventJobSchema,
} from "src/gen/proto/jobs/v1/integration_event_job_pb";
import { Err } from "./checkout/lib/err";

export async function handleWebhook(
  /// utf-8 encoded json string
  payload: string,
  /// Headers or Signature X-Content-Signature
  headers: Record<string, string | undefined>,
  /// webhook secret from admin panel
  secret: string,
) {
  const signature =
    headers?.["x-content-signature"] ?? headers?.["X-Content-Signature"];

  return handleWebhookSignature(payload, signature ?? "", secret);
}

export async function handleWebhookSignature(
  /// utf-8 encoded json string
  payload: string,
  /// Signature X-Content-Signature
  signature: Record<string, string> | string,
  /// webhook secret from admin panel
  secret: string,
): Promise<ReturnType> {
  // Validate hmac512 signature
  const hmac = crypto.createHmac("sha512", secret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest("hex");

  if (signature != calculatedSignature) {
    return {
      ...Err("Invalid signature", "badInput"),
      isErr: true,
    };
  }

  return {
    ...fromJson(IntegrationEventJobSchema, payload),
    isErr: false,
  };
}

type ReturnType =
  | (Err & { isErr: true })
  | (IntegrationEventJob & { isErr: false });
