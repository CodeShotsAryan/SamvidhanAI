import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface DeleteConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm }: DeleteConfirmationModalProps) {
    const [shouldRender, setShouldRender] = useState(false);
    const [shouldAnimate, setShouldAnimate] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setTimeout(() => setShouldAnimate(true), 10);
        } else {
            setShouldAnimate(false);
            const timer = setTimeout(() => setShouldRender(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleClose = () => {
        onClose();
    };

    const handleConfirm = () => {
        onConfirm();
    };

    if (!shouldRender) return null;

    return (
        <div
            className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 transition-opacity duration-200 ${shouldAnimate ? 'opacity-100' : 'opacity-0'
                }`}
            onClick={handleClose}
        >
            <div
                className={`bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-zinc-200 transition-all duration-200 ${shouldAnimate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 min-w-12 bg-rose-100 rounded-full flex items-center justify-center shrink-0">
                        <X className="w-6 h-6 text-rose-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-zinc-900">Delete Conversation?</h3>
                        <p className="text-sm text-zinc-600">This action cannot be undone</p>
                    </div>
                </div>
                <p className="text-zinc-700 mb-6 text-sm">
                    Are you sure you want to delete this conversation?
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-lg font-medium transition-all duration-200 text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}