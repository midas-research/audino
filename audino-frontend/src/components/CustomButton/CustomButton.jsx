const CustomButton = ({ type = 'button', label, className, ...rest }) => {
    return (
        <button
            type={type}
            className={`
               border-x border-t rounded-t-md px-4 py-2 text-sm dark:border-audino-charcoal border-gray-300 
                ${className}
            `}
            {...rest}
        >
            {label}
        </button>
    );
};

export default CustomButton;
