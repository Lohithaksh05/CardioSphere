// Create a new component (e.g., ArticlePopup.js)
import React from "react";
import { Dialog, Transition } from "@headlessui/react";

const ArticlePopup = ({ article, isOpen, onClose }) => {
    if (!article) {
        return null;
      }
    
  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={onClose}
      >
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />
          </Transition.Child>

          <span
            className="inline-block h-screen align-middle"
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
            <div className="inline-block w-full max-w-[48rem] p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <h2 className="text-xl font-bold mb-4 text-black">{article.title}</h2>
              <p className="text-gray-700">{article.content}</p>
              <p className="text-gray-700 mt-2">Author: {article.author}</p>

              <button
                className="mt-5 px-7 py-2 rounded-md border border-gray-600 hover:bg-pink-400 ease-in duration-200 text-black hover:text-white text-dark"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ArticlePopup;
