
import React from 'react';
import { ChipIcon } from './icons/ChipIcon';

export const MediatekInfo: React.FC = () => {
    return (
        <div className="bg-gray-900/40 border border-yellow-500/30 rounded-lg p-4">
            <h3 className="text-md font-bold text-yellow-300 flex items-center gap-2">
                <ChipIcon className="w-5 h-5" />
                MediaTek Onarımı Nasıl Çalışır?
            </h3>
            <div className="text-xs text-gray-300/80 mt-3 space-y-2">
                 <p>
                    <strong>Başarının Sırrı "Donör" Dosyasıdır:</strong> MediaTek cihazlarda onarımın çalışması için, programın imza anahtarlarını kopyalayabileceği, çalışan bir `critical_data` yedeğine ihtiyacı vardır.
                </p>
                <p>
                   <strong>Yapılması Gerekenler:</strong> Onarılacak cihazla <strong>aynı modele ait, çalışan başka bir cihazdan</strong> alınmış bir `critical_data` yedeği bulun ve aşağıdaki "Donör" alanına yükleyin.
                </p>
                <p>
                   Bu araç, donör dosyadan aldığı imzaları sizin onarılacak dosyanıza otomatik olarak uygulayarak %100 uyumlu bir onarım dosyası oluşturacaktır.
                </p>
            </div>
        </div>
    );
};
