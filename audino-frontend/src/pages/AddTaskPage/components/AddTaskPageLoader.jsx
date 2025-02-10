export default function AddTaskPageLoader() {
    return <div className="rounded-lg bg-white dark:bg-audino-navy px-5 py-6 shadow sm:px-6 min-h-full ">
        <div role="status" className="max-w-md p-4 space-y-4 animate-pulse md:p-6 ">

            {[...Array(5).keys()].map(load =>
                <div className="" key={`addprojectloader-${load}`}>
                    <div className="h-3.5 bg-gray-300 rounded-full dark:bg-gray-600 w-48 mb-2.5"></div>
                    <div className="w-3/4 h-3 bg-gray-200 rounded-full dark:bg-gray-700 mb-10"></div>

                </div>)}

        </div>
    </div>
}