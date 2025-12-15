
import React, { useEffect, useRef } from 'react';

interface LogDisplayProps {
    logs: string[];
}

export const LogDisplay: React.FC<LogDisplayProps> = ({ logs }) => {
    const logContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (logContainerRef.current) {
            logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
        }
    }, [logs]);

    return (
        <div ref={logContainerRef} className="flex-grow overflow-y-auto pr-2">
            <ul className="space-y-1">
                {logs.map((log, index) => {
                    const isSuccess = log.toLowerCase().includes('başarıyla tamamlandı');
                    const isError = log.toLowerCase().includes('hata');
                    
                    let colorClass = 'text-gray-400';
                    if (isSuccess) colorClass = 'text-green-400';
                    if (isError) colorClass = 'text-red-400';

                    return (
                        <li key={index} className={`text-xs ${colorClass} font-mono break-all`}>
                           <span className="text-cyan-400 mr-2">&gt;</span>{log}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};
