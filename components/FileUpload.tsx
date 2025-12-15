
import React, { useState, useCallback } from 'react';
import { UploadIcon } from './icons/UploadIcon';

interface FileUploadProps {
    label: string;
    onFileSelect: (file: File | null) => void;
    disabled: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ label, onFileSelect, disabled }) => {
    const [fileName, setFileName] = useState<string | null>(null);
    const uniqueId = `file-upload-${label.replace(/\s+/g, '-').toLowerCase()}`;

    const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        if (file) {
            setFileName(file.name);
            onFileSelect(file);
        } else {
            setFileName(null);
            onFileSelect(null);
        }
    }, [onFileSelect]);
    
    return (
        <div className="space-y-2">
            <label htmlFor={uniqueId} className="block text-sm font-medium text-gray-300">{label}</label>
            <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${disabled ? 'bg-gray-700/50 border-gray-600' : 'border-gray-500 hover:border-cyan-400'}`}>
                <div className="space-y-1 text-center">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-400">
                        <label htmlFor={uniqueId} className={`relative cursor-pointer bg-gray-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-800 focus-within:ring-cyan-500 ${disabled ? 'cursor-not-allowed text-gray-500' : ''}`}>
                            <span>Bir dosya seçin</span>
                            <input id={uniqueId} name={uniqueId} type="file" className="sr-only" onChange={handleFileChange} accept=".bin,.txt" disabled={disabled} />
                        </label>
                        <p className="pl-1">veya sürükleyip bırakın</p>
                    </div>
                    <p className="text-xs text-gray-500">
                        .bin veya .txt formatında
                    </p>
                    {fileName && <p className="text-sm text-green-400 pt-2 font-semibold">{fileName}</p>}
                </div>
            </div>
        </div>
    );
};
