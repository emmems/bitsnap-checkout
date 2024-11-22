import { getCheckoutMethods, getProjectID } from "./CartProvider";
import { useCheckoutStore } from "./state";


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

export function showCart() {
  useCheckoutStore.setState({ isCartVisible: true });
}

export function hideCart() {
  useCheckoutStore.setState({ isCartVisible: false });
}
