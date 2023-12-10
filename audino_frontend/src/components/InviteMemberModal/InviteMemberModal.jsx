import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";

export default function InviteMemberModal({
  open,
  onClose,
  onSuccess,
  onCancel,
  isLoading = false,
}) {
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("worker");

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSuccess({ email: email, role: selectedRole });
    setEmail("");
  };

  const handleCancel = () => {
    setEmail("");
    setSelectedRole("worker");
    onCancel();
  };
  return (
    <Transition.Root show={open} as={React.Fragment} appear>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              aria-hidden="true"
            ></div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <div className="inline-block my-auto align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white p-6">
                  <h3 className="text-lg font-medium text-gray-900">
                    Invite Members
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Enter the email and select the role for the new member.
                  </p>

                  <form className="flex justify-between  gap-4 mt-4 ">
                    <div className="flex items-center  w-full">
                      <input
                        type="email"
                        id="email"
                        className="p-2 border border-gray-300 focus:border-green-100 block w-full rounded-md focus:ring-green-200"
                        value={email}
                        required
                        placeholder="Enter email"
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>

                    <div className="flex items-center w-1/2">
                      <select
                        id="role"
                        className="border border-gray-300  focus:border-green-100 block w-full rounded-md focus:ring-green-500"
                        value={selectedRole}
                        onChange={handleRoleChange}
                      >
                        <option value="worker">Worker</option>
                        <option value="supervisor">Supervisor</option>
                        <option value="maintainer">Maintainer</option>
                      </select>
                    </div>
                  </form>

                  <div className="mt-10">
                    <div className=" flex justify-end">
                      <button
                        type="button"
                        className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800 hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-600"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="ml-3 flex rounded-md bg-[#65B892] px-3 py-2 text-sm font-medium text-white hover:bg-[#65B892] focus:outline-none focus:ring-1 focus:ring-green-600"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <svg
                            aria-hidden="true"
                            role="status"
                            className="h-5 w-5 mr-2 animate-spin text-white"
                            viewBox="0 0 100 101"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                              fill="#E5E7EB"
                            />
                            <path
                              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                              fill="currentColor"
                            />
                          </svg>
                        ) : null}
                        Ok
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition.Root>
  );
}
