'use client'

import {ChangeEvent, ComponentProps, useState} from 'react';
import './ImageInput.css'

interface ImageInputProps extends ComponentProps<'input'> {
    onUpload: () => Promise<string>
}

export default function ImageInput({onUpload, className, style, ...rest}: ImageInputProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setIsUploading(true);
            setMessage('Uploading...');

            // Create FormData object
            onUpload()
                .then(() => {
                    setMessage('File uploaded successfully!');
                    setIsUploading(false);
                })
                .catch(() => {
                    setMessage('Error uploading file. Please try again.');
                    setIsUploading(false);
                })

        } catch {
            setMessage('Error uploading file. Please try again.');
            setIsUploading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4">
                <label
                    className={`px-4 py-2 rounded cursor-pointer text-white transition-colors
                    ${isUploading ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'} ${className}`}
                    style={style}
                    >
                    {isUploading ? 'Uploading...' : 'Choose File'}
                    <input
                        type="file"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        {...rest}
                    />
                </label>
                {message && (
                    <span className={`text-sm ${
                        message.includes('Error') ? 'text-red-500' : 'text-green-500'
                    }`}>
                        {message}
                    </span>
                )}
            </div>
        </div>
    );
}