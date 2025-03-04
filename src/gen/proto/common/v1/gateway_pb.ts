// @generated by protoc-gen-es v2.2.3 with parameter "target=ts"
// @generated from file common/v1/gateway.proto (package common.v1, syntax proto3)
/* eslint-disable */

import type { GenEnum, GenFile } from "@bufbuild/protobuf/codegenv1";
import { enumDesc, fileDesc } from "@bufbuild/protobuf/codegenv1";

/**
 * Describes the file common/v1/gateway.proto.
 */
export const file_common_v1_gateway: GenFile = /*@__PURE__*/
  fileDesc("Chdjb21tb24vdjEvZ2F0ZXdheS5wcm90bxIJY29tbW9uLnYxKokBCgdHYXRld2F5Eg8KC0dBVEVXQVlfQUxMEAASFwoTR0FURVdBWV9QUlpFTEVXWV8yNBABEhIKDkdBVEVXQVlfU1RSSVBFEAISEAoMR0FURVdBWV9UUEFZEAMSHAoYR0FURVdBWV9DQVNIX09OX0RFTElWRVJZEAQSEAoMR0FURVdBWV9GUkVFEAVCTlpMZ2l0aHViLmNvbS9lbW1lbXMvc3VwZXItY2FydC9hcHBzL3Nydi13b3JrZXIvdXRpbHMvbW9kZWxzL2NvbW1vbi92MTtjb21tb252MWIGcHJvdG8z");

/**
 * @generated from enum common.v1.Gateway
 */
export enum Gateway {
  /**
   * @generated from enum value: GATEWAY_ALL = 0;
   */
  ALL = 0,

  /**
   * @generated from enum value: GATEWAY_PRZELEWY_24 = 1;
   */
  PRZELEWY_24 = 1,

  /**
   * @generated from enum value: GATEWAY_STRIPE = 2;
   */
  STRIPE = 2,

  /**
   * @generated from enum value: GATEWAY_TPAY = 3;
   */
  TPAY = 3,

  /**
   * @generated from enum value: GATEWAY_CASH_ON_DELIVERY = 4;
   */
  CASH_ON_DELIVERY = 4,

  /**
   * @generated from enum value: GATEWAY_FREE = 5;
   */
  FREE = 5,
}

/**
 * Describes the enum common.v1.Gateway.
 */
export const GatewaySchema: GenEnum<Gateway> = /*@__PURE__*/
  enumDesc(file_common_v1_gateway, 0);

