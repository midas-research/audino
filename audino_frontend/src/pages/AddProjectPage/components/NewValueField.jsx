import { useState } from "react"
import Picker from '@emoji-mart/react'
import { FaceSmileIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function NewValueField({ onRemoveLabel, index, showEmojiList, setShowEmojiList, value, setValue }) {
    const fetchEmojiData = async () => {
        const response = await fetch(
            'https://cdn.jsdelivr.net/npm/@emoji-mart/data',
        )

        return response.json()
    }

    // const handleSetValue = (val) => {
    //     const updatedLabelValues = [...value.label_values]
    //     updatedLabelValues[index] = { name: val }

    //     setValue(prev => {
    //         return { ...prev, label_values: updatedLabelValues }
    //     })
    // }

    return <div className="relative flex rounded-md shadow-sm w-full" >
        <div className="relative flex flex-grow items-stretch focus-within:z-10" >
            <input
                type="text"
                name="text"
                id="text"
                className="block w-full rounded-none rounded-l-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-audino-primary sm:text-sm sm:leading-6"
                placeholder="Value 1"
                value={value}
                onChange={(e) => {
                    setValue(e.target.value)
                }}
            />
        </div>
        <button
            type="button"
            className={`relative inline-flex items-center gap-x-1.5 px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 ${typeof (onRemoveLabel) === 'function' ? '' :'rounded-r-md'}`}
            onClick={() => setShowEmojiList(prev => prev.map((val, ind) => {
                if (ind === index) {
                    return !val;
                } else return 0;
            }))}
        >
            {showEmojiList[index] ? <XMarkIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" /> : <FaceSmileIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />}
        </button>
        {typeof (onRemoveLabel) === 'function' ? <button
            type="button"
            className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            onClick={() => onRemoveLabel(index)}
        >
            <TrashIcon className="-ml-0.5 h-5 w-5 text-red-400" aria-hidden="true" />
        </button> : null}
        {showEmojiList[index] ? <div className='absolute top-10 left-0 z-10' >
            <Picker data={fetchEmojiData} onEmojiSelect={(val) => setValue(value + " " + val.native)} />
        </div> : null}
    </div>
}