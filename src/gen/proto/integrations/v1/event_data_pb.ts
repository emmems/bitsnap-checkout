// @generated by protoc-gen-es v2.2.2 with parameter "target=ts"
// @generated from file integrations/v1/event_data.proto (package integrations.v1, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile, GenMessage } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc, messageDesc } from "@bufbuild/protobuf/codegenv1";
import type { Customer, Order } from "./order_pb";
import { file_integrations_v1_order } from "./order_pb";
import type { Message } from "@bufbuild/protobuf";

/**
 * Describes the file integrations/v1/event_data.proto.
 */
export const file_integrations_v1_event_data: GenFile = /*@__PURE__*/
  fileDesc("CiBpbnRlZ3JhdGlvbnMvdjEvZXZlbnRfZGF0YS5wcm90bxIPaW50ZWdyYXRpb25zLnYxIrMBCglFdmVudERhdGESCgoCaWQYASABKAkSJQoFZXZlbnQYAiABKA4yFi5pbnRlZ3JhdGlvbnMudjEuRXZlbnQSKgoFb3JkZXIYAyABKAsyFi5pbnRlZ3JhdGlvbnMudjEuT3JkZXJIAIgBARIwCghjdXN0b21lchgEIAEoCzIZLmludGVncmF0aW9ucy52MS5DdXN0b21lckgBiAEBQggKBl9vcmRlckILCglfY3VzdG9tZXIqkQIKBUV2ZW50EgsKB1VOS05PV04QABIXChNUUkFOU0FDVElPTl9DUkVBVEVEEAESFwoTVFJBTlNBQ1RJT05fU1VDQ0VTUxACEhcKE1RSQU5TQUNUSU9OX0ZBSUxVUkUQAxIXChNUUkFOU0FDVElPTl9FWFBJUkVEEAQSFgoSVFJBTlNBQ1RJT05fQ0hBUkdFEAUSGAoUU1VCU0NSSVBUSU9OX0NSRUFURUQQBhIXChNTVUJTQ1JJUFRJT05fUEFVU0VEEAcSGAoUU1VCU0NSSVBUSU9OX1JFU1VNRUQQCBIYChRTVUJTQ1JJUFRJT05fVVBEQVRFRBAJEhgKFFNVQlNDUklQVElPTl9ERUxFVEVEEApCWlpYZ2l0aHViLmNvbS9lbW1lbXMvc3VwZXItY2FydC9hcHBzL3Nydi13b3JrZXIvdXRpbHMvbW9kZWxzL2ludGVncmF0aW9ucy92MTtpbnRlZ3JhdGlvbnN2MWIGcHJvdG8z", [file_integrations_v1_order]);

/**
 * @generated from message integrations.v1.EventData
 */
export type EventData = Message<"integrations.v1.EventData"> & {
  /**
   * @generated from field: string id = 1;
   */
  id: string;

  /**
   * @generated from field: integrations.v1.Event event = 2;
   */
  event: Event;

  /**
   * @generated from field: optional integrations.v1.Order order = 3;
   */
  order?: Order;

  /**
   * @generated from field: optional integrations.v1.Customer customer = 4;
   */
  customer?: Customer;
};

/**
 * Describes the message integrations.v1.EventData.
 * Use `create(EventDataSchema)` to create a new message.
 */
export const EventDataSchema: GenMessage<EventData> = /*@__PURE__*/
  messageDesc(file_integrations_v1_event_data, 0);

/**
 * @generated from enum integrations.v1.Event
 */
export enum Event {
  /**
   * @generated from enum value: UNKNOWN = 0;
   */
  UNKNOWN = 0,

  /**
   * @generated from enum value: TRANSACTION_CREATED = 1;
   */
  TRANSACTION_CREATED = 1,

  /**
   * @generated from enum value: TRANSACTION_SUCCESS = 2;
   */
  TRANSACTION_SUCCESS = 2,

  /**
   * @generated from enum value: TRANSACTION_FAILURE = 3;
   */
  TRANSACTION_FAILURE = 3,

  /**
   * @generated from enum value: TRANSACTION_EXPIRED = 4;
   */
  TRANSACTION_EXPIRED = 4,

  /**
   * @generated from enum value: TRANSACTION_CHARGE = 5;
   */
  TRANSACTION_CHARGE = 5,

  /**
   * @generated from enum value: SUBSCRIPTION_CREATED = 6;
   */
  SUBSCRIPTION_CREATED = 6,

  /**
   * @generated from enum value: SUBSCRIPTION_PAUSED = 7;
   */
  SUBSCRIPTION_PAUSED = 7,

  /**
   * @generated from enum value: SUBSCRIPTION_RESUMED = 8;
   */
  SUBSCRIPTION_RESUMED = 8,

  /**
   * @generated from enum value: SUBSCRIPTION_UPDATED = 9;
   */
  SUBSCRIPTION_UPDATED = 9,

  /**
   * @generated from enum value: SUBSCRIPTION_DELETED = 10;
   */
  SUBSCRIPTION_DELETED = 10,
}

/**
 * Describes the enum integrations.v1.Event.
 */
export const EventSchema: GenEnum<Event> = /*@__PURE__*/
  enumDesc(file_integrations_v1_event_data, 0);

