import React from 'react';

const Loader = () => {
    return (
        <div className="flex flex-col justify-center items-center h-64 w-full animate-fadeIn">
            <div className="relative">
                <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-600 animate-spin"></div>
                <div className="absolute top-0 left-0 h-16 w-16 rounded-full border-t-4 border-b-4 border-indigo-200 animate-pulse"></div>
            </div>
            <p className="mt-4 text-gray-500 dark:text-gray-400 font-medium animate-pulse">Loading...</p>
        </div>
    );
};

export default Loader;
