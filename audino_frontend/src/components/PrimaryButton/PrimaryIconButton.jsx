import { PlusIcon } from "@heroicons/react/20/solid";

export default function PrimaryIconButton({ className, children, onClick, icon }) {
    return <button onClick={onClick} type="button" className={`inline-flex items-center rounded-md bg-white px-3 py-0.5 text-sm font-medium leading-6 text-audino-primary-dark shadow-sm ring-1 ring-inset ring-audino-primary hover:bg-gray-50 ${className}`}>
        {icon ? icon : <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5 text-audino-primary" aria-hidden="true" />}
        {children}
    </button>
}