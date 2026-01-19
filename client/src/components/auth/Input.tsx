

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, icon, onChange, ...props }) => {
    return (
        <div className="w-full mb-5 group">
            <label className="block text-sm font-semibold text-slate-700 mb-2 transition-colors group-focus-within:text-sky-300">
                {label}
            </label>
            <div className="relative">
                {icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-sky-300">
                        {icon}
                    </div>
                )}
                <input
                    {...props}
                    onChange={onChange}
                    className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none transition-all duration-300 focus:ring-4 focus:ring-sky-100 focus:bg-white text-slate-900 placeholder:text-slate-400`}
                />
            </div>
        </div>
    );
};

export default Input;
