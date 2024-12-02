import { getCheckoutMethods as internalGetCheckoutMethods, getProjectID as internalGetProjectID, setProjectID as internalSetProjectID } from "./CartProvider";
import { useCheckoutStore } from "./state";

// deprecated, use Bitsnap.addProductToCart()
export async function addProductToCart(id: string, quantity: number = 1, metadata?: Record<string, string | undefined>) {
  return Bitsnap.addProductToCart(id, quantity, metadata);
}

// deprecated, use Bitsnap.showCart()
export function showCart() {
  return Bitsnap.showCart()
}

// deprecated, use Bitsnap.hideCart()
export function hideCart() {
  return Bitsnap.hideCart()
}

export namespace Bitsnap {
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

  export function getCheckoutMethods(projectID: string) {
    return internalGetCheckoutMethods(projectID)
  }

  export function getProjectID() {
    return internalGetProjectID()
  }

  export function setProjectID(projectID: string) {
    return internalSetProjectID(projectID)
  }
}
