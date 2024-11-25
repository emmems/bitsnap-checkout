import crypto from "crypto";
import { IntegrationEventJob } from "src/gen/proto/jobs/v1/integration_event_job_pb";
import { Err } from "./checkout/lib/err";

export async function handleWebhook(
  /// utf-8 encoded json string
  payload: string,
  /// Headers or Signature X-Content-Signature
  headers: Record<string, string | undefined>,
  /// webhook secret from admin panel
  secret: string,
): Promise<Err | IntegrationEventJob> {
  const signature =
    headers?.["x-content-signature"] ?? headers?.["X-Content-Signature"];
  if (signature == null) {
    return Err("Missing signature", "badInput");
  }

  return handleWebhookSignature(payload, signature, secret);
}

export async function handleWebhookSignature(
  /// utf-8 encoded json string
  payload: string,
  /// Signature X-Content-Signature
  signature: Record<string, string> | string,
  /// webhook secret from admin panel
  secret: string,
): Promise<Err | IntegrationEventJob> {
  // Validate hmac512 signature
  const hmac = crypto.createHmac("sha512", secret);
  hmac.update(payload);
  const calculatedSignature = hmac.digest("hex");

  if (signature != calculatedSignature) {
    return Err("Invalid signature", "badInput");
  }

  return IntegrationEventJob.fromJson(payload);
}
