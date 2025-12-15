
import React from 'react';
import { ExclamationTriangleIcon } from './icons/ExclamationTriangleIcon';

export const Disclaimer: React.FC = () => {
    return (
        <div className="bg-yellow-900/30 border border-yellow-500/40 rounded-lg p-4 h-full">
            <h3 className="text-lg font-semibold text-yellow-300 flex items-center gap-2">
                <ExclamationTriangleIcon className="w-6 h-6" />
                Önemli Uyarı
            </h3>
            <div className="text-sm text-yellow-200/80 mt-3 space-y-3">
                 <p>
                    <strong>Platform Uyumluluğu:</strong> Bu araç, hem <strong>Qualcomm</strong> (doğru profille) hem de <strong>MediaTek</strong> (donör dosyasıyla) platformları için onarım yapar. Yanlış platform seçimi veya yanlış dosya/profil kullanımı cihazınıza geri döndürülemez zararlar verebilir.
                </p>
                <p>
                    <strong>Yasal Sorumluluk:</strong> Bir cihazın IMEI numarasını değiştirmek birçok ülkede yasa dışıdır. Bu araç yalnızca eğitim ve onarım amaçlıdır. Cihazın orijinal IMEI numarasını geri yüklemek dışında kullanmak yasal sorunlara yol açabilir. Tüm sorumluluk kullanıcıya aittir.
                </p>
                <p>
                    <strong>Teknik Riskler:</strong> Bu işlem risklidir ve cihazınızın kalıcı olarak bozulmasına ("brick" olmasına) neden olabilir. İşleme devam etmeden önce tüm verilerinizi yedeklediğinizden emin olun.
                </p>
            </div>
        </div>
    );
};
