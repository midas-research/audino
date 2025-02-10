
import {  useEffect, useState } from 'react'
import {  MinusCircleIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/20/solid'
import NewValueField from './NewValueField'
import CustomInput from '../../../components/CustomInput/CustomInput'
import useSingleFieldValidation from '../../../utils/inputDebounce'
import { attributeSingleFieldValidation } from '../../../validation/singleValidation'

export default function AttributeFields({ index, onRemoveValue, onRemoveAttribute, value, onInputChange, attributesError, setAttributesError }) {
    const [showEmojiList, setShowEmojiList] = useState(Array.from({ length: value.values.length }, () => false))
    const { debouncedValidation } = useSingleFieldValidation(attributeSingleFieldValidation, 1000, attributesError[index], (val) => {
        const updatedAttributesError = [...attributesError]
        updatedAttributesError[index] = val
        setAttributesError(updatedAttributesError)
    });

    const inputTypesOptions = [
        { label: "Select", value: "select" },
        { label: "Radio", value: "radio" },
        // { label: "Checkbox", value: "checkbox" },
    ]
    const handleInputChange = (name, value) => {
        onInputChange(name, value);
        debouncedValidation({ name, value });
    };

    const handleAddValue = () => {
        onInputChange('values', [...value.values, '']);
        setShowEmojiList(prev => [...prev, false])
    }

    const handleRemoveValue = (valueIndex) => {
        onRemoveValue(valueIndex);
        setShowEmojiList(prev => prev.filter((val, index) => index !== valueIndex))
    }

    const handleRemoveAttribute = () => {
        onRemoveAttribute()
    }

    // remove error if value added
    useEffect(() => {
        if (value.values.length > 0) {
            debouncedValidation({
                name: 'attribute_values', value: value.values
            });
        }
    }, [JSON.stringify(value.values)])

    useEffect(()=>{
        if(value.values.length === 0) handleAddValue();
    },[value.values])

    // console.log(labels, attribute);
    return <div className="w-full" key={`newAttribute-${index}`}>
        <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
            <label
                htmlFor="label-name"
                className="block text-sm font-medium leading-6 dark:text-audino-light-gray text-gray-900 sm:mt-1.5"
            >
                Name
            </label>
            <div className="sm:col-span-2 ">
                <CustomInput
                    type="text"
                    name="name"
                    id="label-name"
                    formError={attributesError[index]}
                    placeholder="Attribute 1"
                    value={value.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                />
            </div>
        </div>

        {/* types */}
        {/* <div className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
            <label
                htmlFor="attribute-types"
                className="block text-sm font-medium leading-6 text-gray-900 sm:mt-1.5"
            >
                Attribute types
            </label>
            <div className="sm:col-span-2">
                <CustomSelect
                    id="input_type"
                    name="input_type"
                    options={inputTypesOptions}
                    formError={attributesError[index]}
                    value={value.input_type}
                    onChange={(e) => handleInputChange('input_type', e.target.value)}
                />
            </div>
        </div> */}


        {/* Values */}
        <fieldset className="space-y-2 px-4 sm:grid sm:grid-cols-3 sm:items-start sm:gap-4 sm:space-y-0 sm:px-6 sm:py-5">
            <legend className="sr-only">Attribute values</legend>
            <div className="text-sm font-medium leading-6 dark:text-audino-light-gray text-gray-900" aria-hidden="true">
                Attribute values
            </div>
            <div className="space-y-1 sm:col-span-2">
                {value?.values?.length ? <div className="relative flex items-start flex-wrap gap-2 mb-2">
                    {/* value */}
                    {value.values.map((val, index) =>
                        <NewValueField key={`label-value-${index}`}
                            onRemoveLabel={(i) => handleRemoveValue(i)}
                            index={index}
                            setShowEmojiList={setShowEmojiList}
                            showEmojiList={showEmojiList}
                            value={value.values[index]}
                            setValue={(val) => {
                                let updatedValues = [...value.values]
                                updatedValues[index] = val;
                                onInputChange('values', updatedValues);
                            }} />
                    )}
                </div> : null}
                <button
                    type="button"
                    className="group !mt-0 flex items-center rounded-md dark:bg-transparent bg-white p-1 focus:outline-none focus:ring-2 focus:ring-audino-primary-dark"
                    onClick={handleAddValue}
                >
                    <span className="flex h-6 w-6 items-center justify-center rounded-full text-audino-primary">
                        <PlusIcon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span className="ml-1 text-sm font-medium text-audino-primary group-hover:text-audino-primary-dark">
                        Add new value
                    </span>
                </button>
                {attributesError[index] && attributesError[index]["attribute_values"] && (
                    <p className="m-0 text-sm text-red-600" id="label-error">
                        {attributesError[index]["attribute_values"][0]}
                    </p>
                )}
            </div>
        </fieldset>

        <div className="flex gap-1 items-center justify-end mr-6 mb-6 text-red-400 hover:text-red-500 hover:cursor-pointer" onClick={handleRemoveAttribute}>
            <button
                type="button"
                className=""
            >
                <span className="sr-only">Close panel</span>
                <MinusCircleIcon className="h-6 w-6 " aria-hidden="true" />
            </button>
            <p className='text-sm'> Remove attribute</p>
        </div>


    </div>
}