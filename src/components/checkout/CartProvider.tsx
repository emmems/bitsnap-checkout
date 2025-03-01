import { createContext, useContext } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import zod from "zod";
import { setCustomHost } from "./constants";
import { buildURL } from "./helper.methods";
import { Err, isErr } from "./lib/err";
import { LinkRequest } from "./link.request.schema";
import { createPaymentURL, injectReferenceToRequestIfNeeded } from "./methods";
import { SingleProduct } from "./product.details.model";

export const MARKETING_AGREEMENT_ID = "__m_a";

export interface CartMethods {
  addProduct(args: {
    productID: string;
    quantity: number;
    metadata?: { [key: string]: string | undefined };
  }): Promise<Err | void>;

  getProducts: () => Promise<
    | Err
    | {
        id: string;
        productID: string;
        quantity: number;
        metadata?: { [key: string]: string | undefined };
        details?: SingleProduct;
      }[]
  >;

  updateQuantity(args: { id: string; quantity: number }): Promise<Err | void>;

  removeProductFromCart: (args: { id: string }) => Promise<Err | void>;

  clearCart: () => Promise<Err | void>;

  getNumberOfElementsInCart: () => Promise<number>;

  setCountry: (country: string) => Promise<Err | void>;
  getCountry: () => Promise<Err | string>;
  getAvailableCountries: () => Promise<Err | { name: string; code: string }[]>;

  redirectToNextStep: () => Promise<Err | { url: string }>;

  justRedirectToPayment: (args: {
    email?: string;
    productID: string;
    name?: string;
    country?: string;
    marketingAgreement?: boolean;
  }) => Promise<
    | Err
    | {
        url: string;
      }
  >;
}

const CartProviderContext = createContext<CartMethods | undefined>(undefined);

export var bitsnapProjectID: string | undefined = undefined;
export function setProjectID(projectID: string) {
  bitsnapProjectID = projectID;
}

export function getProjectID(): string | undefined {
  if (bitsnapProjectID != null) {
    return bitsnapProjectID;
  }
  const me = document.querySelector(
    'script[data-id][data-name="internal-cart"]',
  );
  const projectID = me?.getAttribute("data-id");
  return projectID ?? undefined;
}

function getNewHostIfExist(): string | undefined {
  const me = document.querySelector(
    'script[data-id][data-name="internal-cart"]',
  );
  const customHost = me?.getAttribute("data-custom-host");
  return customHost ?? undefined;
}

const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient();

  const projectID = getProjectID();
  if (projectID == null) {
    return <></>;
  }

  const checkoutMethods = getCheckoutMethods(projectID);

  return (
    <QueryClientProvider client={queryClient}>
      <CartProviderContext.Provider value={checkoutMethods}>
        {children}
      </CartProviderContext.Provider>
    </QueryClientProvider>
  );
};

export const useCartProvider = () => {
  const context = useContext(CartProviderContext);

  if (context === undefined) {
    throw new Error("useCartProvider must be used within a CartProvider");
  }

  return context;
};

export default CartProvider;

const checkoutSchema = zod.object({
  country: zod.string().optional(),
  products: zod
    .array(
      zod.object({
        id: zod.string(),
        productID: zod.string(),
        quantity: zod.number(),
        metadata: zod.record(zod.string().optional()).optional(),
      }),
    )
    .optional(),
});
const emptyCheckout: Checkout = {
  country: undefined,
  products: [],
};
type Checkout = zod.infer<typeof checkoutSchema>;

const checkoutKey = "checkout";

function getCheckout(): Checkout {
  try {
    const value = localStorage.getItem(checkoutKey);
    if (value == null) {
      return emptyCheckout;
    }
    return checkoutSchema.parse(JSON.parse(value));
  } catch (e) {
    return emptyCheckout;
  }
}

function saveCheckout(model: Checkout) {
  localStorage.setItem(checkoutKey, JSON.stringify(model));
}

export const getCheckoutMethods: (projectID: string) => CartMethods = (
  projectID,
) => {
  const newHost = getNewHostIfExist();
  if (newHost != null) {
    setCustomHost(newHost);
  }
  return {
    async clearCart(): Promise<Err | void> {
      const empty = structuredClone(emptyCheckout);
      empty.country = getCheckout()?.country;
      saveCheckout(empty);
    },

    async getAvailableCountries(): Promise<
      Err | { name: string; code: string }[]
    > {
      const result = await fetch(buildURL(projectID, "/countries"), {
        method: "GET",
      });

      if (result.status != 200) {
        return [];
      }

      try {
        return zod
          .array(
            zod.object({
              name: zod.string(),
              code: zod.string(),
            }),
          )
          .parse(await result.json());
      } catch (e) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        return Err(e.toString(), "internal");
      }
    },

    async getCountry(): Promise<Err | string> {
      let country = getCheckout()?.country;
      if (country == null) {
        country = "PL";
        const checkout = getCheckout();
        checkout.country = country;
        saveCheckout(checkout);
      }

      return country;
    },

    async getNumberOfElementsInCart(): Promise<number> {
      return (
        getCheckout()?.products?.reduce(
          (acc, product) => acc + product.quantity,
          0,
        ) ?? 0
      );
    },

    async getProducts(): Promise<
      | Err
      | {
          id: string;
          productID: string;
          quantity: number;
          metadata?: { [p: string]: string | undefined };
          details?: SingleProduct;
        }[]
    > {
      const products = getCheckout()?.products ?? [];

      const productIds = Array.from(
        new Set(products.map((product) => product.productID)),
      );

      const params = new URLSearchParams();
      params.set("ids", productIds.join(","));

      const result = await fetch(
        buildURL(projectID, `/products?${params.toString()}`),
        {
          method: "GET",
        },
      );

      if (result.status != 200) {
        return [];
      }

      const payload: {
        success: boolean;
        message?: string | undefined;
        result?: SingleProduct[] | undefined;
      } = await result.json();

      products.forEach((product) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        product["details"] = payload.result?.find(
          (el) => el.id === product.productID,
        );
      });

      // @ts-ignore
      return products.filter((el) => "details" in el);
    },

    async removeProductFromCart(args: { id: string }): Promise<Err | void> {
      const checkout = getCheckout();

      const newCheckout = {
        ...checkout,
        products: checkout?.products?.filter(
          (product) => product.id !== args.id,
        ),
      };
      saveCheckout(newCheckout);
    },

    async setCountry(country: string): Promise<Err | void> {
      const checkout = getCheckout();
      checkout.country = country;
      saveCheckout(checkout);
    },

    async addProduct(args: {
      productID: string;
      quantity: number;
      metadata?: { [p: string]: string | undefined };
    }): Promise<Err | void> {
      const checkout = getCheckout();
      if (checkout.products == null) {
        checkout.products = [];
      }
      checkout.products.push({
        id: Math.random().toString(36).substring(7),
        productID: args.productID,
        quantity: args.quantity,
        metadata: args.metadata,
      });
      saveCheckout(checkout);
    },

    async updateQuantity(args: {
      id: string;
      quantity: number;
    }): Promise<Err | void> {
      const checkout = getCheckout();
      checkout.products = checkout.products?.map((product) => {
        if (product.id === args.id) {
          product.quantity = args.quantity;
        }
        return product;
      });
      saveCheckout(checkout);
    },

    async redirectToNextStep(): Promise<Err | { url: string }> {
      const checkout = getCheckout();

      if (checkout.products == null || checkout.products.length == 0) {
        return Err("cart-is-empty", "badInput");
      }
      const mergedMetadata = checkout.products.reduce(
        (acc, product) => {
          if (product.metadata != null) {
            Object.keys(product.metadata).forEach((key) => {
              const value = product.metadata?.[key];
              if (value != null) {
                acc[key] = value;
              }
            });
          }
          return acc;
        },
        {} as Record<string, string>,
      );

      const payload: LinkRequest = {
        items: checkout.products.map((el) => {
          return {
            id: el.productID,
            quantity: el.quantity,
          };
        }),
        askForNote: true,
        countries: checkout.country ? [checkout.country] : undefined,
        metadata: mergedMetadata,
      };

      const paymentResponse = await createPaymentURL(payload);

      if (isErr(paymentResponse)) {
        console.warn("cannot create payment URL", paymentResponse.error);
        return paymentResponse;
      }

      return {
        url: paymentResponse.url,
      };
    },

    async justRedirectToPayment(args: {
      email?: string;
      productID: string;
      name?: string;
      country?: string;
      marketingAgreement?: boolean;
    }): Promise<Err | { url: string }> {
      let payload: LinkRequest = {
        items: [
          {
            id: args.productID,
            quantity: 1,
          },
        ],
        askForNote: false,
        details:
          args.email || args.name
            ? {
                name: args.name,
                email: args.email,
              }
            : undefined,
      };

      payload = injectReferenceToRequestIfNeeded(payload);

      if (args.country == null) {
        args.country = "pl";
      }

      if (payload.details == null) {
        payload.details = {};
      }
      if (payload.details.address == null) {
        payload.details.address = {};
      }
      payload.details.address.country = args.country;

      if (args.marketingAgreement === true) {
        payload.additionalAgreements = [
          {
            id: MARKETING_AGREEMENT_ID,
            name: "",
            required: true,
            answer: true,
          },
        ];
      }

      const result = await fetch(buildURL(projectID, "/buy"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      console.log("CODE", result.status);

      if (result.status != 200) {
        console.warn(
          "result",
          await result.text(),
          result.status,
          result.statusText,
        );
        return Err("internal-error", "internal");
      }

      const response: { url: string; sessionID: string } = await result.json();

      console.log(response.url);
      return {
        url: response.url,
      };
    },
  };
};
