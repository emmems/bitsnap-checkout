import {AnimatePresence, motion} from "framer-motion";
import {type MutableRefObject, useEffect, useRef, useState} from "react";

export interface CountrySelectorProps {
    id: string;
    open: boolean;
    disabled?: boolean;
    onToggle: () => void;
    onChange: (value: string) => void;
    selectedValue: string;
    countries: { name: string; code: string }[];
}

function CountrySelector(
    {
        id,
        open,
        disabled = false,
        onToggle,
        onChange,
        selectedValue,
        countries
    }: CountrySelectorProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mutableRef = ref as MutableRefObject<HTMLDivElement | null>;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                mutableRef.current &&
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-expect-error
                !mutableRef.current.contains(event.target) &&
                open
            ) {
                onToggle();
                setQuery("");
            }
        };

        window.document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);

    useEffect(() => {
        if (selectedValue == null && countries.length > 0) {
            onChange(countries[0].code);
        }
    }, []);

    const [query, setQuery] = useState("");

    return (
        <div ref={ref}>
            <div className="relative">
                <button
                    type="button"
                    className={`${
                        disabled ? "ics-bg-neutral-100" : "ics-bg-extra-light-white"
                    } ics-relative ics-w-full ics-rounded-2xl ics-shadow-sm ics-pl-8 ics-pr-10 ics-py-3 ics-text-left ics-cursor-default focus:ics-outline-none focus:ics-ring-1 focus:ics-ring-blue-500 focus:ics-border-blue-500 sm:ics-text-sm`}
                    aria-haspopup="listbox"
                    aria-expanded="true"
                    aria-labelledby="listbox-label"
                    onClick={onToggle}
                    disabled={disabled}
                >
                     <span className="ics-truncate ics-flex ics-items-center">
                        <img
                            alt={`${selectedValue}`}
                            src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${selectedValue}.svg`}
                            className={"ics-inline ics-mr-2 ics-h-4 ics-rounded-sm"}
                        />
                         {countries.find(el => el.code === selectedValue)?.name}
                     </span>
                    <span
                        className={`ics-absolute ics-inset-y-0 ics-right-0 ics-flex ics-items-center ics-pr-2 ics-pointer-events-none ${
                            disabled ? "ics-hidden" : ""
                        }`}
                    >
                    <svg
                        className="h-5 w-5 text-light-purple"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                      <path
                          fillRule="evenodd"
                          d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </button>

                <AnimatePresence>
                    {open && (
                        <motion.ul
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            transition={{duration: 0.1}}
                            className="ics-absolute ics-z-10 -ics-mt-80 ics-w-full dark:ics-bg-neutral-800 ics-bg-white ics-shadow-lg ics-max-h-80 ics-rounded-md ics-text-body-regular ics-ring-1 ics-ring-black ics-ring-opacity-5 focus:ics-outline-none sm:ics-text-body-regular"
                            tabIndex={-1}
                            role="listbox"
                            aria-labelledby="listbox-label"
                            aria-activedescendant="listbox-option-3"
                        >
                            <div className="ics-sticky ics-top-0 ics-z-10 ics-bg-white dark:ics-bg-neutral-800">
                                <li className="dark:ics-text-neutral-200 ics-text-neutral-900 ics-cursor-default ics-select-none ics-relative ics-py-2 ics-px-3">
                                    <input
                                        type="search"
                                        name="search"
                                        autoComplete={"off"}
                                        className="ics-block ics-w-full ics-outline-none sm:ics-text-body-regular dark:ics-text-neutral-400 ics-text-dark-blue ics-bg-transparent ics-border-light-purple ics-rounded-md placeholder:ics-text-light-purple"
                                        placeholder={"Znajdź kraj"}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </li>
                                <hr/>
                            </div>

                            <div
                                className={
                                    "ics-max-h-64 ics-scrollbar ics-scrollbar-track-gray-100 ics-scrollbar-thumb-gray-300 hover:ics-scrollbar-thumb-gray-600 ics-scrollbar-thumb-rounded ics-scrollbar-thin ics-overflow-y-scroll"
                                }
                            >
                                {countries.filter((country) =>
                                    country.name.toLowerCase().startsWith(query.toLowerCase())
                                ).length === 0 ? (
                                    <li className="ics-text-light-purple ics-cursor-default ics-select-none ics-relative ics-py-2 ics-pl-3 ics-pr-9">
                                        No countries found
                                    </li>
                                ) : (
                                    countries.filter((country) =>
                                        country.name.toLowerCase().startsWith(query.toLowerCase())
                                    ).map((value, index) => {
                                        return (
                                            <li
                                                key={`${id}-${index}`}
                                                className="ics-text-dark-blue ics-cursor-default ics-select-none ics-relative ics-py-2 ics-pl-3 ics-pr-9 ics-flex ics-items-center hover:ics-bg-extra-light-white ics-transition"
                                                id="listbox-option-0"
                                                role="option"
                                                onClick={() => {
                                                    onChange(value.code);
                                                    setQuery("");
                                                    onToggle();
                                                }}
                                            >
                                                <img
                                                    alt={`${value.code}`}
                                                    src={`https://purecatamphetamine.github.io/country-flag-icons/3x2/${value.code}.svg`}
                                                    className={"ics-inline ics-mr-2 ics-h-4 ics-rounded-sm"}
                                                />

                                                <span className="ics-font-normal ics-truncate">
                          {value.name}
                        </span>
                                                {value.code === selectedValue ? (
                                                    <span
                                                        className="ics-text-blue-600 ics-absolute ics-inset-y-0 ics-right-0 ics-flex ics-items-center ics-pr-8">
                            <svg
                                className="h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                              <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                              />
                            </svg>
                          </span>
                                                ) : null}
                                            </li>
                                        );
                                    })
                                )}
                            </div>
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}


export default CountrySelector