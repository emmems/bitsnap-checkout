import ApplePayButton from "apple-pay-button";
import { PublicApiClient } from "src/public.api.client";
import CartProvider, { getProjectID, useCartProvider } from "./CartProvider";
import { HOST } from "./constants";
import { isErr } from "./lib/err";
import { round } from "./lib/round.number";

type Props = {
  items: { name: string; id: string; price: number; quantity: number }[];
  onClick?: () => Promise<void>;
};

function ApplePayButtonComponent({ items, onClick }: Props) {
  const {
    getApplePayPaymentRequest,
    completeApplePayPayment,
    setCountry,
    setCouponCodeIfPossible,
    setDeliveryMethod,
    setEmail,
    setPostalCode,
    clearCart,
  } = useCartProvider();
  if (typeof window == "undefined") {
    return null;
  }
  if ("ApplePaySession" in window === false) {
    console.log("No Apple Pay available");
    return null;
  }

  async function beginSession() {
    const session = new ApplePaySession(14, {
      countryCode: "PL",
      merchantCapabilities: ["supports3DS"],
      supportedNetworks: ["visa", "masterCard"],
      total: {
        amount: `${round(items.reduce((acc, item) => acc + item.price * item.quantity, 0) / 100, 2)}`,
        label: "Płatność za koszyk",
        type: "final",
      },
      lineItems: items.map((item) => ({
        amount: `${round((item.price * item.quantity) / 100, 2)}`,
        label: item.name,
        type: "final",
      })),
      currencyCode: "PLN",
    });
    await onClick?.();
    const apRequest = await getApplePayPaymentRequest();
    if (isErr(apRequest)) {
      console.error("Error creating ApplePaySession:", apRequest.error);
      return;
    }

    session.oncancel = (event) => {
      console.log("ApplePaySession cancelled", event);
    };

    session.onvalidatemerchant = async (event) => {
      try {
        const result = await PublicApiClient.get(HOST).applePayValidateMerchant(
          {
            validationUrl: event.validationURL,
            projectId: getProjectID(),
          },
        );
        console.log("merchantSession", result.merchantSession);
        if (result.merchantSession.length > 0) {
          session.completeMerchantValidation(
            JSON.parse(result.merchantSession),
          );
        } else {
          session.abort();
        }
      } catch (error) {
        session.abort;
      }
    };

    session.onshippingmethodselected = async (event) => {
      await setDeliveryMethod(event.shippingMethod.identifier);
      const apRequest = await getApplePayPaymentRequest();
      if (isErr(apRequest)) {
        session.abort();
        throw new Error("Failed to get Apple Pay payment request");
      }

      session.completeShippingMethodSelection({
        newTotal: apRequest.total,
        newLineItems: apRequest.lineItems,
        newShippingMethods: apRequest.shippingMethods,
      });
    };
    session.onshippingcontactselected = async (event) => {
      try {
        if (event.shippingContact.countryCode != null) {
          await setCountry(event.shippingContact.countryCode);
        }
        if (event.shippingContact.postalCode != null) {
          await setPostalCode(event.shippingContact.postalCode);
        }
        if (event.shippingContact.phoneNumber != null) {
          await setEmail(event.shippingContact.emailAddress);
        }
        const apRequest = await getApplePayPaymentRequest();
        if (isErr(apRequest)) {
          session.abort();
          throw new Error("Failed to get Apple Pay payment request");
        }

        session.completeShippingContactSelection({
          newLineItems: apRequest.lineItems,
          newTotal: apRequest.total,
          newShippingMethods: apRequest.shippingMethods,
        });
      } catch (error) {
        console.log("shipping contact selected error", error);
        session.abort;
      }
    };

    session.oncouponcodechanged = async (event) => {
      try {
        const result = await setCouponCodeIfPossible(event.couponCode);
        const apRequest = await getApplePayPaymentRequest();
        if (isErr(apRequest)) {
          session.abort();
          throw new Error("Failed to get Apple Pay payment request");
        }

        session.completeCouponCodeChange({
          errors: isErr(result)
            ? [new ApplePayError("couponCodeInvalid")]
            : undefined,
          newTotal: apRequest.total,
          newLineItems: apRequest.lineItems,
          newShippingMethods: apRequest.shippingMethods,
        });
      } catch (error) {
        console.log("coupon code changed error", error);
      }
    };

    session.onpaymentauthorized = async (event) => {
      try {
        const result = await completeApplePayPayment({
          token: event.payment.token,
          billingContact: event.payment.billingContact,
          shippingContact: event.payment.shippingContact,
        });
        if (isErr(result)) {
          console.log("apple pay error", result);
          session.completePayment({
            status: ApplePaySession.STATUS_FAILURE,
          });
          return;
        }

        clearCart();
        session.completePayment({
          status: ApplePaySession.STATUS_SUCCESS,
        });
        if (result.redirectURL) {
          setTimeout(() => {
            open(result.redirectURL);
          }, 2000);
        }
      } catch (e) {
        session.completePayment({
          status: ApplePaySession.STATUS_FAILURE,
        });
      }
      // event.complete(ApplePaySession.STATUS_SUCCESS);
    };

    session.begin();
  }

  return <ApplePayButton onClick={beginSession} />;
}

function Wrapper(props: Props) {
  return (
    <>
      <CartProvider>
        <ApplePayButtonComponent {...props} />
      </CartProvider>
    </>
  );
}
export default Wrapper;
