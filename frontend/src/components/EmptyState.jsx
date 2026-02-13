import React from 'react';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({ 
    title = "No data found", 
    description = "There are no records to display at the moment.", 
    icon: Icon = PackageOpen,
    actionLabel,
    onAction
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 animate-fadeIn">
            <div className="bg-gray-50 dark:bg-slate-700/50 p-4 rounded-full mb-4">
                <Icon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {title}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                {description}
            </p>
            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;
