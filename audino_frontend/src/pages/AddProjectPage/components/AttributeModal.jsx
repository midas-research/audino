
import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/20/solid'
import PrimaryButton from '../../../components/PrimaryButton/PrimaryButton'
import { attributeAllValidation } from '../../../validation/allValidation'
import AttributeFields from './AttributeFields'
import { useLabelStore } from '../../../zustand-store/labels'

const initialData = {
    default_value: "",
    input_type: "select",
    mutable: false,
    name: "",
    values: []
}
export default function AttributeModal({ open, setOpen, currentLabelIndex, setCurrentLabelIndex }) {
    const labels_obj = useLabelStore((state) => state.labels_obj);
    const setLabels = useLabelStore((state) => state.setLabels);

    const [attributes, setAttributes] = useState([initialData])
    const [attributesError, setAttributesError] = useState([{
        name: null,
        attribute_values: null,
    }]);

    const handleCreate = () => {
        let isReadyToMerge = true;
        for (let index = 0; index < attributes.length; index++) {
            const attrib = attributes[index];
            const { isValid, error } = attributeAllValidation({
                name: attrib.name,
                attribute_values: attrib.values,
            });
            if (!isValid) {
                isReadyToMerge = false;
                const updatedAttributesError = [...attributesError];
                updatedAttributesError[index] = error;
                setAttributesError(updatedAttributesError)
            }
        }
        if (isReadyToMerge) {
            if (currentLabelIndex >= 0) {
                const updatedLabels = [...labels_obj.results]
                updatedLabels[currentLabelIndex].attributes = attributes
                setLabels({ ...labels_obj, results: updatedLabels })
            }
            handleCancel();
        }
    }

    const handleCancel = () => {
        setOpen(false);
        setCurrentLabelIndex(-1)
        setAttributes([initialData])
    }

    const handleRemoveAttributeValue = (attribIndex, valueIndex) => {
        console.log(attribIndex, valueIndex);
        const updatedAttributes = [...attributes]
        let updatedAttribValues = [...updatedAttributes[attribIndex].values];
        updatedAttribValues = updatedAttribValues.filter((val, index) => index !== valueIndex)

        updatedAttributes[attribIndex] = {
            ...updatedAttributes[attribIndex],
            values: updatedAttribValues
        }
        setAttributes(updatedAttributes)
    }


    const handleRemoveAttribute = (attribIndex) => {
        let updatedAttributes = [...attributes]
        updatedAttributes = updatedAttributes.filter((val, index) => index !== attribIndex)

        setAttributes(updatedAttributes)
    }

    const handleAddAttribute = () => {
        setAttributes(prev => [...prev, initialData])
    }

    const handleAttributeFieldChange = (name, val, index) => {
        const updatedAttributes = [...attributes]
        updatedAttributes[index] = {
            ...updatedAttributes[index],
            [name]: val
        }
        setAttributes(updatedAttributes)
    }


    // set attribute fields
    useEffect(() => {
        if (currentLabelIndex >= 0 && labels_obj.results[currentLabelIndex].attributes.length) {
            setAttributes(labels_obj.results[currentLabelIndex].attributes)
        }
    }, [currentLabelIndex])

    // // remove error if label added
    // useEffect(() => {
    //     if (attribute.values.length > 0) {
    //         debouncedValidation({
    //             name: 'attribute_values', value: attribute.values
    //         });
    //     }
    // }, [JSON.stringify(attribute.values)])

    // console.log(attributes);
    return <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
            <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-500"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-500"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
            >
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
                        <Transition.Child
                            as={Fragment}
                            enter="transform transition ease-in-out duration-500 sm:duration-700"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transform transition ease-in-out duration-500 sm:duration-700"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                                <form className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="bg-gray-50 px-4 py-6 sm:px-6">
                                            <div className="flex items-start justify-between space-x-3">
                                                <div className="space-y-1">
                                                    <Dialog.Title className="text-base font-semibold leading-6 text-gray-900">
                                                        Add attributes
                                                    </Dialog.Title>
                                                    <p className="text-sm text-gray-500">
                                                        Click on add new attribute button below to create your new attribute.
                                                    </p>
                                                </div>
                                                <div className="flex h-7 items-center">
                                                    <button
                                                        type="button"
                                                        className="text-gray-400 hover:text-gray-500"
                                                        onClick={handleCancel}
                                                    >
                                                        <span className="sr-only">Close panel</span>
                                                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* list of attribute fields */}
                                        {attributes.length ? <div className="relative flex items-start flex-wrap gap-2 mb-2 space-y-6 py-6 sm:space-y-0 sm:divide-y sm:divide-gray-200 sm:py-0">
                                            {attributes.map((attr, index) =>
                                                <AttributeFields
                                                    key={`attributefields-${index}`}
                                                    index={index}
                                                    onRemoveValue={(i) => handleRemoveAttributeValue(index, i)}
                                                    onRemoveAttribute={() => handleRemoveAttribute(index)}
                                                    onInputChange={(name, val) => handleAttributeFieldChange(name, val, index)}
                                                    value={attributes[index]}
                                                    attributesError={attributesError}
                                                    setAttributesError={setAttributesError}
                                                />

                                            )}
                                        </div> : null}

                                        <button
                                            type="button"
                                            className="group !mt-0 flex items-center rounded-md bg-white p-1 focus:outline-none focus:ring-2 focus:ring-audino-primary-dark mx-auto mb-6"
                                            onClick={handleAddAttribute}
                                        >
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-audino-primary text-audino-primary">
                                                <PlusIcon className="h-4 w-4" aria-hidden="true" />
                                            </span>
                                            <span className="ml-3 text-sm font-medium text-audino-primary group-hover:text-audino-primary-dark">
                                                Add new attribute
                                            </span>
                                        </button>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="flex-shrink-0 border-t border-gray-200 px-4 py-5 sm:px-6">
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </button>
                                            <PrimaryButton onClick={handleCreate}>Update</PrimaryButton>
                                        </div>
                                    </div>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </div>
        </Dialog>
    </Transition.Root>
}