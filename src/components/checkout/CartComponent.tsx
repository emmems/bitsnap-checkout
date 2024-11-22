import { useAutoAnimate } from "@formkit/auto-animate/react";
import { createPortal } from "react-dom";
import CartComponentContent from "./CartComponentContent";
import CartProvider from "./CartProvider";

interface Props {
    isVisible: boolean;
    shouldHide: () => void;
}

function CartComponent({isVisible, shouldHide}: Props) {
    const [parent] = useAutoAnimate(/* optional config */)


    return (
        <div ref={parent} className={'ics-z-[999999]'}>
            {isVisible && (
                <>
                  chuj w dupe
                    <div className={'ics-fixed ics-top-0 ics-right-0 ics-left-0 ics-bottom-0 ics-bg-black/30 ics-cursor-pointer'} onClick={shouldHide}></div>
                    <div className={'ics-fixed ics-top-0 ics-right-0 ics-bottom-0 ics-w-full md:ics-w-[350px] xl:ics-w-[420px] dark:ics-bg-neutral-900 ics-bg-neutral-300 dark:ics-text-neutral-200 ics-text-neutral-900 ics-flex ics-flex-col'}>
                        <div className={'ics-mx-3 ics-mt-7 ics-flex ics-justify-between ics-items-center'}>
                            <h1 className={'text-2xl font-medium'}>Koszyk</h1>
                            <button className="ics-rounded-full dark:hover:ics-bg-neutral-700 hover:ics-bg-neutral-400 ics-p-2 ics-transition" onClick={shouldHide}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                     fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                     strokeLinejoin="round" className="lucide lucide-x">
                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                </svg>
                            </button>
                        </div>

                        <CartComponentContent className={"grow"} />

                    </div>
                </>
            )}
        </div>
    );
}

const WrapperCartComponent = (props: Props) => {
  if (typeof window === 'undefined') {
      return null;
  }

    return createPortal((
        <CartProvider>
            <CartComponent {...props} />
        </CartProvider>
    ), document.body);
}

export default WrapperCartComponent;
