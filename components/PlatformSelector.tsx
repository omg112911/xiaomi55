
import React from 'react';
import { ChipIcon } from './icons/ChipIcon';
import { Platform } from '../App';


interface PlatformSelectorProps {
    onPlatformSelect: (platform: Platform) => void;
}

export const PlatformSelector: React.FC<PlatformSelectorProps> = ({ onPlatformSelect }) => {
    return (
        <div className="p-6 md:p-10 text-center">
            <h2 className="text-2xl font-bold text-cyan-300 mb-2">Başlamadan Önce</h2>
            <p className="text-gray-400 mb-8">Lütfen onarım yapılacak cihazın işlemci platformunu seçin. Bu, doğru aracın yüklenmesi ve cihazınızın güvenliği için kritik bir adımdır.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Qualcomm Card */}
                <button 
                    onClick={() => onPlatformSelect('qualcomm')}
                    className="group text-left p-6 bg-gray-900/50 rounded-lg border-2 border-gray-700 hover:border-cyan-500 hover:bg-cyan-900/30 transition-all"
                >
                    <h3 className="text-xl font-bold text-cyan-400">Qualcomm</h3>
                    <p className="text-sm text-gray-400 mt-2 group-hover:text-gray-300">
                        RSA imza (`critical_data`) tabanlı IMEI ve şebeke onarımı. Birçok Snapdragon işlemcili Xiaomi modeliyle uyumludur.
                    </p>
                </button>

                {/* MediaTek Card */}
                 <button 
                    onClick={() => onPlatformSelect('mediatek')}
                    className="group text-left p-6 bg-gray-900/50 rounded-lg border-2 border-gray-700 hover:border-yellow-500 hover:bg-yellow-900/30 transition-all"
                >
                    <h3 className="text-xl font-bold text-yellow-400">MediaTek (MTK)</h3>
                    <p className="text-sm text-gray-400 mt-2 group-hover:text-gray-300">
                        `critical_data` yedeği üzerinden IMEI ve şebeke onarımı. Platforma özel doğru profilin seçilmesi gerekir.
                    </p>
                </button>
            </div>
        </div>
    );
};
