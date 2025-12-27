import { AlertTriangle, Info, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

function ConfirmationModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  type = 'danger',
  confirmText = 'Delete',
  cancelText = 'Cancel'
}) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      const timer = setTimeout(() => setIsAnimating(false), 200);
      document.body.style.overflow = 'unset';
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isOpen && !isAnimating) return null;

  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className={`relative w-full max-w-md bg-[#1a1a1a] border border-[#262626] rounded-2xl shadow-2xl transform transition-all duration-200 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#262626]">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${type === 'danger' ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
              {type === 'danger' ? <AlertTriangle size={20} /> : <Info size={20} />}
            </div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-gray-300 leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-[#262626] bg-[#1f1f1f]/50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-gray-400 hover:bg-[#2a2a2a] hover:text-white transition-all"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${
              type === 'danger' 
                ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-red-500/20' 
                : 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:shadow-blue-500/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmationModal;
