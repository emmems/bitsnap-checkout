import { useAutoAnimate } from "@formkit/auto-animate/react";
import React from "react";
import { useMutation, useQuery } from "react-query";
import { useCartProvider } from "./CartProvider";
import CountrySelector from "./CountrySelector";
import { isErr } from "./lib/err";
import { formatCurrency } from "./lib/round.number";
import LoadingIndicator from "./LoadingIndicator";
import SingleProduct from "./SingleProduct";
import { Skeleton } from "./Skeleton";
import { ApplePayButton } from "..";

const CartComponentContent = ({ className }: { className: string }) => {
  const provider = useCartProvider();
  const { mutateAsync: removeProduct } = useMutation(
    provider.removeProductFromCart,
  );
  const { mutateAsync: updateQuantity } = useMutation(provider.updateQuantity);
  const { mutateAsync: setCountryAsync } = useMutation(provider.setCountry);
  const { mutateAsync: clearCart } = useMutation(provider.clearCart);

  const [errMsg, setErrMsg] = React.useState("");

  const [isCountryOpen, setIsCountryOpen] = React.useState(false);

  const {
    mutateAsync: continueToCheckoutAsync,
    isLoading: isContinueToCheckoutLoading,
  } = useMutation(provider.redirectToNextStep);

  const { data: availableCountries } = useQuery(
    "cart-available-countries",
    provider.getAvailableCountries,
  );
  const { data: isApplePayAvailable } = useQuery("cart-one-click-payment", provider.checkIfApplePayIsAvailable);
  const { data, isLoading, refetch } = useQuery("cart", provider.getProducts);
  const { data: countryData, refetch: refetchCountry } = useQuery(
    "cart-country",
    provider.getCountry,
  );

  const [productsParent] = useAutoAnimate(/* optional config */);

  const products = isErr(data) ? undefined : data;

  const countries = isErr(availableCountries) ? [] : availableCountries;

  const sumOfProducts =
    products?.reduce((prev, curr) => {
      if (curr.details == null) {
        return prev;
      }
      return prev + curr.details.price * curr.quantity;
    }, 0) ?? 0;
  const currency = products?.[0]?.details?.currency ?? "PLN";

  const isSomeProductDeliverable =
    products?.some((product) => product.details?.isDeliverable === true) ??
    false;

  const selectedCountry =
    countryData != null && !isErr(countryData) && countryData != ""
      ? countryData
      : undefined;

  async function shouldUpdate(id: string, newQuantity?: number) {
    if (newQuantity != null) {
      if (newQuantity <= 0) {
        await removeProduct({ id: id });
        await refetch();
        return;
      }

      await updateQuantity({
        id: id,
        quantity: newQuantity,
      });
      await refetch();
      return;
    }
  }

  async function continueToCheckout() {
    try {
      setErrMsg("");

      const response = await continueToCheckoutAsync();

      if (isErr(response)) {
        setErrMsg(`${response.error}`);
        return;
      }

      await clearCart();
      window.location.href = response.url;
    } catch (e: unknown) {
      setErrMsg(`${e}`);
    }
  }

  return (
    <div className={`${className} ics-flex ics-flex-col`} ref={productsParent}>
      {isLoading && (
        <div className={"ics-relative ics-flex ics-w-full ics-justify-center ics-flex-col ics-gap-4"}>
          <Skeleton className={"ics-w-full ics-h-32"} />
          <Skeleton className={"ics-w-full ics-h-32"} />
        </div>
      )}

      {!isLoading && (products == null || products.length == 0) && (
        <div className={"ics-flex ics-flex-col ics-gap-4 ics-p-4"}>
          <p className={"dark:ics-text-neutral-400 ics-text-neutral-700"}>
            Brak produktów w koszyku.
          </p>
        </div>
      )}

      <div
        className={"ics-max-h-[70vh] ics-overflow-clip ics-overflow-y-scroll"}
      >
        {products != null && products.length > 0 && (
          <ul className={"ics-mt-5"}>
            {products.map((product) => (
              <React.Fragment key={product.id}>
                {product.details != null && (
                  <li className={"mb-3"}>
                    <SingleProduct
                      quantity={product.quantity}
                      details={product.details}
                      shouldUpdate={(newQuantity) => {
                        shouldUpdate(product.id, newQuantity).then().catch();
                      }}
                    />
                    <hr className="ics-h-1 dark:ics-border-neutral-700 ics-border-neutral-400" />
                  </li>
                )}
              </React.Fragment>
            ))}
          </ul>
        )}
      </div>

      <div className="grow"></div>

      {sumOfProducts > 0 && currency != null && (
        <>
          <div className="ics-mx-3 ics-flex ics-flex-col">
            <div
              className={
                "ics-flex ics-flex-row ics-justify-between ics-text-lg"
              }
            >
              <p
                className={
                  "dark:ics-text-neutral-200 ics-text-neutral-800 ics-text-xl"
                }
              >
                Suma:
              </p>
              <div className={"ics-flex ics-flex-col ics-items-end"}>
                <p
                  className={
                    "dark:ics-text-neutral-200 ics-text-neutral-800 ics-font-medium"
                  }
                >
                  {formatCurrency(sumOfProducts, currency)}
                </p>
                {isSomeProductDeliverable && (
                  <p className={"ics-opacity-70 ics-text-right ics-text-base"}>
                    + dostawa
                  </p>
                )}
              </div>
            </div>
          </div>

          {countries && countries?.length > 1 && (
            <div>
              <h4
                className={
                  "ics-ml-3 ics-text-sm dark:ics-text-neutral-400 ics-text-neutral-700"
                }
              >
                Wybierz kraj
              </h4>
              <CountrySelector
                id={Math.random().toString()}
                open={isCountryOpen}
                onToggle={() => {
                  setIsCountryOpen(!isCountryOpen);
                }}
                onChange={(newValue) => {
                  setCountryAsync(newValue).then(() => {
                    refetchCountry().then().catch();
                  });
                }}
                selectedValue={selectedCountry ?? ""}
                countries={countries}
              />
            </div>
          )}

          <div className={"ics-mb-3 ics-flex ics-flex-col"}>
            {isApplePayAvailable && products != null && products.length > 0 && (
              <div className="ics-mb-1 ics-w-full">
                <ApplePayButton colorType="white" style={{ width: '100%' }} items={products?.map(el => ({
                  name: el.details?.name ?? "",
                  id: el.productID,
                  price: el.details?.price ?? 0,
                  quantity: el.quantity,
                  isDeliverable: el.details?.isDeliverable ?? false,
                  metadata: el.metadata,
                }))} />
              </div>
            )}
            <button
              onClick={continueToCheckout}
              disabled={
                isLoading ||
                isContinueToCheckoutLoading ||
                selectedCountry == null
              }
              className={
                "ics-px-3 ics-py-2 ics-my-2 ics-mx-2 ics-rounded-md disabled:ics-opacity-40 disabled:ics-cursor-not-allowed dark:ics-bg-neutral-300 dark:hover:ics-bg-neutral-100 dark:ics-text-neutral-800 hover:ics-bg-neutral-900 ics-text-neutral-200 ics-bg-neutral-800 ics-transition ics-font-bold"
              }
            >
              {isContinueToCheckoutLoading ? "Ładowanie..." : "Następny krok"}
            </button>
            {errMsg.length > 0 && (
              <p className={"ics-text-red-500 ics-text-sm ics-text-center"}>
                {errMsg}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CartComponentContent;
