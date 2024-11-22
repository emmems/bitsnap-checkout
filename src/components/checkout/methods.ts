import { getCheckoutMethods, getProjectID } from "./CartProvider";


export async function addProductToCart(id: string, quantity: number = 1, metadata?: Record<string, string | undefined>) {
  const projectID = getProjectID();
  if (projectID == null) {
    throw new Error("No project ID found");
  }

  const methods = getCheckoutMethods(projectID);

  const err = await methods.addProduct({
      productID: id,
      quantity: quantity,
      metadata: metadata,
  });
  if (err != null) {
    return err
  }
  return undefined;
}
