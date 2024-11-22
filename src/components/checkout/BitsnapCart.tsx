import { useEffect, useState } from 'react';
import zod from "zod";
import CartComponent from "./CartComponent";
import { getCheckoutMethods, getProjectID } from "./CartProvider";
import { isErr } from "./lib/err";

enum CartEvent {
    ADD_TO_CART = 'ADD_TO_CART',
}

const cartAddToCartSchema = zod.object({
    id: zod.string(),
    isSubscription: zod.boolean().default(false),
    quantity: zod.number(),
    metadata: zod.record(zod.string().optional()).optional(),
});

type CartAddToCartEvent = zod.infer<typeof cartAddToCartSchema>;

function BitsnapCart({ children, onVisibleChange, className }: { children?: React.ReactNode; onVisibleChange?: (isVisible: boolean) => void; className?: string }) {
    const [isCartVisible, setIsCartVisible] = useState(false)

    function sentPostMessageToIframe(msg: unknown) {
        const iframes = document.querySelectorAll('iframe');

        iframes.forEach((iframe) => {
            iframe.contentWindow?.postMessage(msg, '*');
        });
    }

  useEffect(() => {
    onVisibleChange?.(isCartVisible);
  }, [isCartVisible]);

    useEffect(() => {
        if (!('cart' in window)) {
            const projectID = getProjectID();
            if (projectID == null) {
                console.warn('There is no project ID configured.');
                return;
            }
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            window['cart'] = {
                buyProduct: async (args: unknown) => {
                    try {
                        const payload = zod.object({
                            productID: zod.string(),
                            email: zod.string().optional(),
                            name: zod.string().optional(),
                            country: zod.string().optional(),
                            marketingAgreement: zod.boolean().optional(),
                        }).parse(args);

                        const methods = getCheckoutMethods(projectID);

                        const result = await methods.justRedirectToPayment(payload);

                        if (isErr(result) == false) {
                            window.location.href = result.url;
                        } else {
                            alert('Nie udało się przekierować do płatności. Spróbuj ponownie później.')
                        }

                    } catch (e) {
                        console.warn(e);
                    }

                }
            }
        }
    }, []);

    async function handleAddingToCart(id: string, payload?: unknown) {
        const projectID = getProjectID();
        if (projectID == null) {
            console.warn('There is no project ID configured.');
            return;
        }

        try {
            const data = cartAddToCartSchema.parse(payload);

            if (data.isSubscription) {
                await handleAddingSubscriptionToCart(projectID, data);
                return;
            }

            const methods = getCheckoutMethods(projectID);

            await methods.addProduct({
                productID: data.id,
                quantity: data.quantity,
                metadata: data.metadata,
            });

            sentPostMessageToIframe({
                id: id,
                type: CartEvent.ADD_TO_CART,
                success: true,
            });
            setIsCartVisible(true);

        } catch (e) {
            console.warn('cannot add item to cart', e);
        }
    }

    async function handleAddingSubscriptionToCart(projectID: string, event: CartAddToCartEvent) {
        alert(`TODO, nie jest to jeszcze zrobione ${projectID} ${event.id} ${event.quantity}`);
    }

    function setupEventListener() {
        if ('__cart_is_listening' in window) {
            return;
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        window['__cart_is_listening'] = true;
        window.addEventListener('message', (event) => {
            if (typeof event.data['id'] != 'undefined' && typeof event.data['type'] != 'undefined') {
                const {id, type} = event.data;
                switch (type) {
                    case CartEvent.ADD_TO_CART.toString():
                        handleAddingToCart(id, event.data['payload']).then().catch();
                        break;
                    default: break;
                }
            }
        });
    }

    useEffect(() => {
        setupEventListener();
    }, []);

    return (
        <>
          <button onClick={() => setIsCartVisible(!isCartVisible)} className={className ?? 'ics-rounded-full hover:ics-bg-neutral-300 ics-transition ics-p-1'}>
          { children ? (
            <>
              {children}
            </>
          ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                     className="lucide lucide-shopping-cart">
                    <circle cx="8" cy="21" r="1"/>
                    <circle cx="19" cy="21" r="1"/>
                    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
                </svg>
                )}
            </button>
            <CartComponent isVisible={isCartVisible} shouldHide={() => {
                setIsCartVisible(false)
            }}
            />
        </>
    )
}

export default BitsnapCart