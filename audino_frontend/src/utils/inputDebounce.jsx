import { useCallback } from 'react';

const useSingleFieldValidation = (singleFieldValidation, delay, formError, setFormError) => {

    const debouncedSingleFieldValidation = useCallback(
        ({ name, value }) => {
            const { isValid, errors } = singleFieldValidation({ key: name, value });
            let tempError = { ...formError };
            if (isValid) tempError = { ...tempError, [name]: null };
            else tempError = { ...tempError, [name]: errors[name] };
            setFormError(tempError);
        },
        [formError, singleFieldValidation]
    );

    const debounce = useCallback(
        (func) => {
            let timer;
            return (...args) => {
                if (timer) clearTimeout(timer);
                timer = setTimeout(() => {
                    func.apply(null, args);
                }, delay);
            };
        },
        [delay]
    );

    const debouncedValidation = useCallback(debounce(debouncedSingleFieldValidation), [debouncedSingleFieldValidation]);

    return { debouncedValidation };
};

export default useSingleFieldValidation;
