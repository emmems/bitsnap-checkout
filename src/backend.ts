import { BitsnapModels } from "./models"

export namespace BitsnapBackend {
  export async function getProduct(projectID: string, id: string) {
    const payload = {
      '0': {
        projectID: projectID,
        id: id,
      },
    }

    const encodedPayload = new URLSearchParams()
    encodedPayload.set('batch', '1')
    encodedPayload.set('input', JSON.stringify(payload))

    const result = await fetch(
      'https://bitsnap.pl/api/trpc/product.getProductById?' + encodedPayload.toString(),
      {
        headers: {
          'Content-Type': 'application/json',
          Priority: 'u=3, i',
        },
      },
    )

    const downloadedPayload = await result.json()

    const parsedResult = await BitsnapModels.ProductResultSchema.parseAsync(downloadedPayload)

    if (parsedResult.length == 0) {
      return undefined
    }
    const parsed = parsedResult[0]

    return parsed.result;
  }

  export async function getProducts(projectID: string, limit: number, offset: number) {
    const productsPayload = {
      '0': {
        projectID: projectID,
        limit: limit,
        offset: offset,
      },
    }
    const encodedPayload = new URLSearchParams()
    encodedPayload.set('batch', '1')
    encodedPayload.set('input', JSON.stringify(productsPayload))

    const result = await fetch(
      'https://bitsnap.pl/api/trpc/product.getProductGrid?' + encodedPayload.toString(),
      {
        headers: {
          'Content-Type': 'application/json',
          Priority: 'u=3, i',
        },
      },
    )

    const downloadedPayload = await result.json()

    const parsedResult = await BitsnapModels.ProductsResultElementSchema.parseAsync(downloadedPayload)
    if (parsedResult.length == 0) {
      return {
        categories: undefined,
        products: undefined,
      }
    }
    const parsed = parsedResult[0]

    return parsed.result;
  }
}
