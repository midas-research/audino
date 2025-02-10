import { MagnifyingGlassIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

function CustomSearch({onRefresh, onSearch}) {
    const [searchInputValue, setSearchInputValue] = useState("");
    const [isRotating, setIsRotating] = useState(false);
    
    const handleButtonClick = () => {
        setIsRotating(true);
        onRefresh();
        setTimeout(() => setIsRotating(false), 500); 
    };

    const handleSearchInput = (e) => {
        const value = e.target.value;
        setSearchInputValue(value);
        onSearch(value);
    }
    return (
        <div class="flex gap-1">
            <div className="w-full max-w-xl">
                <label htmlFor="search" className="sr-only">
                    Search
                </label>
                <div className="relative text-gray-400 focus-within:text-audino-primary">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <input
                        id="search"
                        className="block w-full dark:bg-audino-light-navy rounded-md border-2 border-gray-300 dark:border-audino-gray py-1 pl-10 pr-3 text-gray-900 dark:text-audino-storm-gray focus:ring-offset-1 focus:ring-offset-audino-primary focus:border-transparent focus:ring-0 sm:text-sm sm:leading-6"
                        placeholder="Search"
                        type="search"
                        name="search"
                        value={searchInputValue}
                        onChange={handleSearchInput}
                    />
                </div>
            </div>
            <button onClick={handleButtonClick} className="px-2 border rounded-md dark:bg-audino-light-navy border-gray-300 dark:border-audino-gray text-gray-900 dark:text-audino-storm-gray focus:ring-offset-1 focus:ring-offset-audino-primary focus:border-transparent focus:ring-0">
                <ArrowPathIcon className={`h-5 w-5 transition-transform ${isRotating ? "animate-spin-once" : ""}`}
                />
            </button>
        </div>
    )
}

export default CustomSearch