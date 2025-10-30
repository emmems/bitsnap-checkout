import { useEffect, useState } from "react";
import { formatCurrency } from "./lib/round.number";
import type { SingleProduct } from "./product.details.model";


const SingleProduct = ({ quantity, details, shouldUpdate }: {
    quantity: number;
    metadata?: { [key: string]: string | undefined };
    details: SingleProduct;
    shouldUpdate: (newQuantity?: number) => void;
}) => {

    return (
        <div className={'ics-flex ics-items-center ics-gap-3'}>
            <img className={'ics-aspect-auto ics-max-w-[30%] ics-max-w-32 ics-max-h-32'} src={details.image_url ?? ''} alt={details.name} />

            <div className={'ics-flex ics-flex-col'}>
                <p className={'ics-font-medium'}>{details.name}</p>
                <p className={'ics-text-sm'}>{formatCurrency(details.price, details.currency)}</p>
                <div className={'ics-flex ics-justify-between'}>
                    <QuantityComponent className={""} quantity={quantity} shouldUpdate={shouldUpdate} />
                    <button className={'ics-text-sm ics-font-medium'} onClick={() => shouldUpdate(0)}>Usuń</button>
                </div>
            </div>
        </div>
    );
}

export default SingleProduct;

const QuantityComponent = (
    {
        quantity,
        shouldUpdate,
        className
    }: {
        quantity: number;
        shouldUpdate: (newQuantity: number) => void;
        className: string;
    }) => {
    const [quantityString, setQuantityString] = useState(quantity.toString());
    const [quantityValue, setQuantityValue] = useState(quantity);

    useEffect(() => {
        shouldUpdate(quantityValue);
    }, [quantityValue]);

    function setNewQuantity(newQuantity: string) {
        setQuantityString(newQuantity);
        if (newQuantity.length == 0) {
            return;
        }
        const parsedInt = parseInt(newQuantity);
        if (isNaN(parsedInt)) {
            setQuantityValue(1);
            setQuantityString('');
            return;
        }
        if (parsedInt == 0 || parsedInt < 0) {
            setQuantityValue(1);
            setQuantityString("1");
            return;
        }
        setQuantityValue(parsedInt);
        setQuantityString(parsedInt.toString());
    }

    function increaseQuantity() {
        setQuantityValue(quantity + 1);
        setQuantityString((quantity + 1).toString());
    }

    function decreaseQuantity() {
        if (quantity > 1) {
            setQuantityString((quantity - 1).toString());
            setQuantityValue(quantity - 1);
            return;
        }
        setQuantityString(quantity.toString());
        setQuantityValue(quantity);
    }

    return (
        <div className={`ics-flex ${className} ics-items-center ics-border dark:ics-border-neutral-400 ics-border-neutral-700 ics-rounded-md ics-my-1`}>
            <button onClick={decreaseQuantity} className={'ics-px-2 ics-py-1'}>-</button>
            <input
                className={'ics-w-8 ics-bg-transparent ics-text-center'}
                value={quantityString}
                onInput={(e) => { setNewQuantity(e.currentTarget.value) }}
                type="text"
            />
            <button onClick={increaseQuantity} className={'ics-px-2 ics-py-1'}>+</button>
        </div>
    );
}
