import { BitsnapModels } from "./models";

let BACKEND_HOST = "https://bitsnap.pl";

export namespace BitsnapBackend {
  export async function setCustomHost(host: string) {
    BACKEND_HOST = host;
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
}
