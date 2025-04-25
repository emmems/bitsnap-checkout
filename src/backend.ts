import zod from 'zod';
import { BitsnapModels } from "./models";

let BACKEND_HOST = "https://bitsnap.pl";
let API_KEY: string | undefined;

export namespace BitsnapBackend {
  export async function setCustomHost(host: string) {
    BACKEND_HOST = host;
  }
  export async function setApiKey(apiKey: string) {
    API_KEY = apiKey;
  }

  export async function getProduct(
    projectID: string,
    id: string,
    requestInit?: RequestInit,
  ) {
    const payload = {
      "0": {
        projectID: projectID,
        id: id,
      },
    };

    const encodedPayload = new URLSearchParams();
    encodedPayload.set("batch", "1");
    encodedPayload.set("input", JSON.stringify(payload));

    console.log("ta funkcja się odpala", BACKEND_HOST);
    const now = performance.now();
    const result = await fetch(
      BACKEND_HOST +
        "/api/trpc/product.getProductById?" +
        encodedPayload.toString(),
      {
        ...(requestInit ?? {}),
        headers: {
          ...(requestInit?.headers ?? {}),
          "Content-Type": "application/json",
          Priority: "u=3, i",
        },
      },
    );
    console.log("zapytanie zakończone", performance.now() - now);

    const downloadedPayload = await result.json();

    const parsedResult =
      await BitsnapModels.ProductResultSchema.parseAsync(downloadedPayload);

    if (parsedResult.length == 0) {
      return undefined;
    }
    const parsed = parsedResult[0];

    return parsed.result;
  }

  export async function getProducts(
    projectID: string,
    limit: number,
    offset: number,
    requestInit?: RequestInit,
  ) {
    const productsPayload = {
      "0": {
        projectID: projectID,
        limit: limit,
        offset: offset,
      },
    };
    const encodedPayload = new URLSearchParams();
    encodedPayload.set("batch", "1");
    encodedPayload.set("input", JSON.stringify(productsPayload));

    const result = await fetch(
      BACKEND_HOST +
        "/api/trpc/product.getProductGrid?" +
        encodedPayload.toString(),
      {
        ...(requestInit ?? {}),
        headers: {
          ...(requestInit?.headers ?? {}),
          "Content-Type": "application/json",
          Priority: "u=3, i",
        },
      },
    );

    const downloadedPayload = await result.json();

    const parsedResult =
      await BitsnapModels.ProductsResultElementSchema.parseAsync(
        downloadedPayload,
      );
    if (parsedResult.length == 0) {
      return {
        categories: undefined,
        products: undefined,
      };
    }
    const parsed = parsedResult[0];

    return parsed.result;
  }

  export async function sendNotification(request: NotificationRequest, requestInit?: RequestInit) {
    if (API_KEY == null || API_KEY == '') {
      throw new Error('use BitsnapBackend.setApiKey("{{API_KEY}} to setup api key before using this method.")')
    }
    const result = await fetch(
      BACKEND_HOST +
        "/api/notification/send",
      {
        ...(requestInit ?? {}),
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          ...(requestInit?.headers ?? {}),
          "Content-Type": "application/json",
          'Authorization': 'Bearer ' + API_KEY,
        },
      },
    );

    if (result.status != 200) {
      console.warn('error while sending notification', await result.text());
      return 'failure';
    }
    return 'success';
  }
}

const notificationRequestSchema = zod
  .object({
    to: zod.array(zod.string()),
    title: zod.string(),
    body: zod.string().optional(),
    type: zod.enum(['push', 'email', 'sms']).default('push'),
    emailOptions: zod.object({
      subject: zod.string().optional(),
      replyTo: zod.string().optional(),

      htmlText: zod.string().optional(),
    }).optional(),
  });
export type NotificationRequest = zod.infer<typeof notificationRequestSchema>;
