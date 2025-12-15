
import React from 'react';

interface ImeiInputProps {
    label: string;
    imei: string;
    onImeiChange: (value: string) => void;
    isValid: boolean;
    disabled: boolean;
}

export const ImeiInput: React.FC<ImeiInputProps> = ({ label, imei, onImeiChange, isValid, disabled }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value.replace(/[^0-9]/g, ''); // Sadece rakamlara izin ver
        if (value.length <= 15) {
            onImeiChange(value);
        }
    };
    
    const uniqueId = `imei-input-${label.replace(/\s+/g, '-').toLowerCase()}`;

    return (
        <div className="space-y-2">
            <label htmlFor={uniqueId} className="block text-sm font-medium text-gray-300">{label}</label>
            <div className="relative">
                <input
                    id={uniqueId}
                    type="text"
                    value={imei}
                    onChange={handleChange}
                    placeholder="15 haneli IMEI"
                    disabled={disabled}
                    maxLength={15}
                    className={`block w-full px-4 py-3 bg-gray-900/70 border rounded-md shadow-sm placeholder-gray-500
                        focus:outline-none focus:ring-2 transition-all text-lg
                        ${!imei ? 'border-gray-600 focus:ring-cyan-500 focus:border-cyan-500' : ''}
                        ${imei && isValid ? 'border-green-500 focus:ring-green-500' : ''}
                        ${imei && !isValid ? 'border-red-500 focus:ring-red-500' : ''}
                        ${disabled ? 'cursor-not-allowed bg-gray-700/50' : ''}
                    `}
                />
                 <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-500">
                    {imei.length}/15
                </span>
            </div>
            {imei && !isValid && <p className="text-xs text-red-400">IMEI 15 haneli bir sayı olmalıdır.</p>}
        </div>
    );
};
