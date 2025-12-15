
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { FileUpload } from './components/FileUpload';
import { ImeiInput } from './components/ImeiInput';
import { LogDisplay } from './components/LogDisplay';
import { Disclaimer } from './components/Disclaimer';
import { ModelSelector, SIGNATURE_PROFILES } from './components/ModelSelector';
import { ChipIcon } from './components/icons/ChipIcon';
import { CheckCircleIcon } from './components/icons/CheckCircleIcon';
import { ExclamationTriangleIcon } from './components/icons/ExclamationTriangleIcon';
import { SpinnerIcon } from './components/icons/SpinnerIcon';
import { PlatformSelector } from './components/PlatformSelector';
import { ArrowLeftIcon } from './components/icons/ArrowLeftIcon';
import { KeyProfileCreator } from './components/KeyProfileCreator';

// CRC-32 Checksum Implementation
const makeCrc32Table = () => {
    let c;
    const crcTable = [];
    for (let n = 0; n < 256; n++) {
        c = n;
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
        }
        crcTable[n] = c;
    }
    return crcTable;
};
const crc32Table = makeCrc32Table();
const crc32 = (buf: Uint8Array): number => {
    let crc = 0 ^ (-1);
    for (let i = 0; i < buf.length; i++) {
        crc = (crc >>> 8) ^ crc32Table[(crc ^ buf[i]) & 0xFF];
    }
    return (crc ^ (-1)) >>> 0;
};

// Hex utility functions
const hexToBytes = (hex: string): Uint8Array => {
    if (hex.length % 2 !== 0) {
      throw new Error("Invalid hex string");
    }
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
        bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
};
const numberToLittleEndianHex = (num: number, len: number = 8): string => {
    const hex = num.toString(16).padStart(len, '0');
    // For a 32-bit number (8 hex chars), e.g., AABBCCDD, little-endian is DDCCBBAA
    return hex.match(/../g)!.reverse().join('');
};

const parseKeysFromDonorFile = (content: string): { modulus: string, sign: string, dataSign: string } => {
    const lines = content.split(/[\r\n]+/);
    const keys: { [key: string]: string } = {};
    const keyNames = ['devPubKeyModulus', 'devPubKeySign', 'crticalDataSign'];

    for (const line of lines) {
        const parts = line.split(':');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(':').trim();
            if (keyNames.includes(key)) {
                keys[key] = value;
            }
        }
    }

    if (!keys.devPubKeyModulus || !keys.devPubKeySign || !keys.crticalDataSign) {
        throw new Error('Donör dosyası geçersiz veya gerekli imza anahtarlarını içermiyor (devPubKeyModulus, devPubKeySign, crticalDataSign bulunamadı).');
    }

    return {
        modulus: keys.devPubKeyModulus,
        sign: keys.devPubKeySign,
        dataSign: keys.crticalDataSign
    };
};


export type ProfileKey = keyof typeof SIGNATURE_PROFILES;
export type Platform = 'qualcomm' | 'mediatek' | null;
export type CustomProfile = { modulus: string, sign: string, dataSign: string } | null;

const App: React.FC = () => {
    const [platform, setPlatform] = useState<Platform>(null);
    const [criticalDataFile, setCriticalDataFile] = useState<File | null>(null);
    const [customProfile, setCustomProfile] = useState<CustomProfile>(null);
    const [selectedProfile, setSelectedProfile] = useState<ProfileKey | ''>('');
    const [newImei1, setNewImei1] = useState<string>('');
    const [newImei2, setNewImei2] = useState<string>('');
    const [isProcessing, setIsProcessing] = useState<boolean>(false);
    const [logs, setLogs] = useState<string[]>([]);
    const [modifiedFileUrl, setModifiedFileUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    const processedFile = useRef<File | null>(null);
    const processedProfileRef = useRef<string | null>(null);
    const processedImei1 = useRef<string>('');
    const processedImei2 = useRef<string>('');
   
    const isImei1Valid = useMemo(() => /^\d{15}$/.test(newImei1), [newImei1]);
    const isImei2Valid = useMemo(() => /^\d{15}$/.test(newImei2), [newImei2]);
    
    const isReadyForProcessing = useMemo(() => {
        const baseChecks = criticalDataFile && isImei1Valid && isImei2Valid;
        if (!baseChecks) return false;

        if (platform === 'mediatek') {
            return !!customProfile;
        }

        if (platform === 'qualcomm') {
            return !!selectedProfile;
        }

        return false;
    }, [criticalDataFile, customProfile, isImei1Valid, isImei2Valid, platform, selectedProfile]);

    const addLog = useCallback((message: string) => {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    }, []);

    const processAndPatchFile = async (): Promise<string> => {
        if (!criticalDataFile || !platform) throw new Error("Dosyalar veya platform eksik.");

        let patchKeys: { modulus: string, sign: string, dataSign: string, exponent: string };
        let originalFileContent = await criticalDataFile.text();
        addLog(`'${criticalDataFile.name}' (onarılacak dosya) okundu.`);
        
        if (platform === 'mediatek') {
            if (!customProfile) throw new Error("MediaTek onarımı için bir anahtar profili oluşturulmalı.");
            addLog(`Özel anahtar profili kullanılıyor.`);
            patchKeys = { ...customProfile, exponent: '10001' };
            addLog("İmza anahtarları profilden başarıyla yüklendi.");
        } else { // qualcomm
             if (!selectedProfile) throw new Error("Qualcomm onarımı için bir profil seçilmeli.");
             const profile = SIGNATURE_PROFILES[selectedProfile];
             if (!profile || !profile.data) throw new Error("Seçilen profil geçersiz.");
             patchKeys = { 
                 modulus: profile.data.devPubKeyModulus, 
                 sign: profile.data.devPubKeySign, 
                 dataSign: profile.data.crticalDataSign,
                 exponent: profile.data.devPubKeyExponent
            };
            addLog(`"${profile.name}" profili yüklendi.`);
        }

        let originalCriticalDataHex = '';
        let originalCriticalDataKey = 'criticalData'; 
        for (const line of originalFileContent.split(/[\r\n]+/)) {
            const match = line.match(/(criticalData|crticalData)\s*:\s*(.*)/i);
            if (match) {
                originalCriticalDataKey = match[1];
                originalCriticalDataHex = match[2].trim();
                break;
            }
        }
        if (!originalCriticalDataHex) throw new Error('Yüklenen yedek dosyasında "criticalData" anahtarı bulunamadı.');
        addLog(`Orijinal dosyadan '${originalCriticalDataKey}' bölümü okundu.`);
        
        const imeiToHex = (str: string) => str.split('').map(c => c.charCodeAt(0).toString(16)).join('');
        const newImei1Hex = imeiToHex(newImei1);
        const newImei2Hex = imeiToHex(newImei2);
        
        let modifiedCriticalDataHex = originalCriticalDataHex;
        const imei1TagIndex = modifiedCriticalDataHex.indexOf('020f');
        if (imei1TagIndex === -1) throw new Error("IMEI 1 alanı (tag 020f) bulunamadı.");
        modifiedCriticalDataHex = modifiedCriticalDataHex.slice(0, imei1TagIndex + 4) + newImei1Hex + modifiedCriticalDataHex.slice(imei1TagIndex + 4 + 30);
        addLog(`Yeni IMEI 1 yazılıyor: ${newImei1}`);
        
        const imei2TagIndex = modifiedCriticalDataHex.indexOf('030f');
        if (imei2TagIndex === -1) throw new Error("IMEI 2 alanı (tag 030f) bulunamadı.");
        modifiedCriticalDataHex = modifiedCriticalDataHex.slice(0, imei2TagIndex + 4) + newImei2Hex + modifiedCriticalDataHex.slice(imei2TagIndex + 4 + 30);
        addLog(`Yeni IMEI 2 yazılıyor: ${newImei2}`);

        const dataPartHex = modifiedCriticalDataHex.slice(0, -8);
        const dataBytes = hexToBytes(dataPartHex);
        const newChecksum = crc32(dataBytes);
        const newChecksumHex = numberToLittleEndianHex(newChecksum);
        addLog(`Yeni checksum hesaplandı: ${newChecksumHex.toUpperCase()}`);
        const finalCriticalDataHex = dataPartHex + newChecksumHex;

        let patchedFileContent = originalFileContent;
        const replacer = (key: string, value: string) => {
            const regex = new RegExp(`^(${key}\\s*:\\s*).+`, "mi");
            if(regex.test(patchedFileContent)){
                patchedFileContent = patchedFileContent.replace(regex, `$1${value}`);
                addLog(`'${key}' değeri güncellendi.`);
            } else {
                 addLog(`UYARI: '${key}' alanı dosyada bulunamadı, bu normal olabilir.`);
            }
        };

        replacer('devPubKeyModulus', patchKeys.modulus);
        replacer('devPubKeySign', patchKeys.sign);
        replacer(originalCriticalDataKey, finalCriticalDataHex);
        replacer('crticalDataSign', patchKeys.dataSign);
        
        addLog('Orijinal dosya yeni verilerle yamalandı.');
        return patchedFileContent;
    };

    const handleProcessFile = useCallback(async () => {
        if (!isReadyForProcessing) return;

        setIsProcessing(true);
        setLogs([]);
        setError(null);
        setModifiedFileUrl(null);

        try {
            addLog('İşlem otomatik olarak başlatılıyor...');
            const modifiedContent = await processAndPatchFile();
            
            addLog('Onarılmış yedek dosyası oluşturuluyor...');
            const blob = new Blob([modifiedContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            setModifiedFileUrl(url);

            addLog('İşlem başarıyla tamamlandı!');
            processedFile.current = criticalDataFile;
            processedImei1.current = newImei1;
            processedImei2.current = newImei2;
            processedProfileRef.current = customProfile ? JSON.stringify(customProfile) : selectedProfile;

        } catch (e: any) {
            const errorMessage = `HATA: ${e.message}`;
            setError(errorMessage);
            addLog(errorMessage);
        } finally {
            setIsProcessing(false);
        }
    }, [isReadyForProcessing, platform, criticalDataFile, customProfile, selectedProfile, newImei1, newImei2, addLog]);
    
    useEffect(() => {
        if (isReadyForProcessing && !isProcessing) {
             const currentProfile = customProfile ? JSON.stringify(customProfile) : selectedProfile;
             if (criticalDataFile !== processedFile.current || 
                 currentProfile !== processedProfileRef.current ||
                 newImei1 !== processedImei1.current || 
                 newImei2 !== processedImei2.current) {
                handleProcessFile();
             }
        }
    }, [isReadyForProcessing, isProcessing, criticalDataFile, customProfile, newImei1, newImei2, selectedProfile, handleProcessFile]);

    const resetState = () => {
        setLogs([]);
        setError(null);
        setModifiedFileUrl(null);
    }

    const handleFileSelect = (file: File | null) => {
        setCriticalDataFile(file);
        resetState();
    }
    
    const handleProfileCreation = async (file: File | null) => {
        setCustomProfile(null);
        resetState();
    
        if (!file) {
            addLog("Özel profil temizlendi.");
            return;
        }

        addLog(`'${file.name}' dosyasından anahtar profili oluşturuluyor...`);
        try {
            const content = await file.text();
            const keys = parseKeysFromDonorFile(content);
            setCustomProfile(keys);
            addLog("Anahtar profili başarıyla oluşturuldu ve yüklendi.");
        } catch (e: any) {
            const errorMessage = `HATA: Profil oluşturulamadı. ${e.message}`;
            setError(errorMessage);
            addLog(errorMessage);
            setCustomProfile(null);
        }
    };
    
    const handleProfileChange = (value: ProfileKey | '') => {
        setSelectedProfile(value);
        resetState();
    }

    const getFooterContent = () => {
        if (isProcessing) {
            return ( <div className="flex items-center justify-center gap-3 text-lg font-bold py-3 px-6 rounded-lg bg-gray-700 text-cyan-300"><SpinnerIcon className="w-6 h-6" /><span>İŞLENİYOR...</span></div> );
        }
        if (error) {
            return ( <div className="flex items-center gap-3 bg-red-900/50 text-red-300 p-3 rounded-lg border border-red-500/30"><ExclamationTriangleIcon className="w-6 h-6" /><p className="text-sm font-semibold">{error}</p></div> );
        }
        if (modifiedFileUrl) {
            return ( <div className="flex flex-col items-center gap-3 bg-green-900/50 p-4 rounded-lg border border-green-500/30 text-center"><CheckCircleIcon className="w-8 h-8 text-green-400" /><p className="font-semibold text-green-300">Onarılmış dosya hazır!</p><a href={modifiedFileUrl} download={`PATCHED_${criticalDataFile?.name || 'critical_data.txt'}`} className="inline-block bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-500 transition-colors">İNDİR</a></div> );
        }
        
        let guideText = "Otomatik onarım için tüm adımları tamamlayın.";
        if (!criticalDataFile) {
            guideText = "Başlamak için onarılacak 'critical_data' dosyasını yükleyin.";
        } else if (platform === 'mediatek' && !customProfile) {
             guideText = "Lütfen 2. adımdaki araçla bir imza profili oluşturun.";
        } else if (platform === 'qualcomm' && !selectedProfile) {
            guideText = "Lütfen cihazınız için bir imza profili seçin.";
        } else if (!isImei1Valid || !isImei2Valid) {
            guideText = "Lütfen her iki alan için de 15 haneli geçerli IMEI'ler girin.";
        }
    
        return ( <div className="text-center text-gray-500 py-4"><p>{guideText}</p></div> );
    };
    
    const handlePlatformSelect = (selectedPlatform: Platform) => {
        setPlatform(selectedPlatform);
        setCriticalDataFile(null);
        setCustomProfile(null);
        setSelectedProfile('');
        setNewImei1('');
        setNewImei2('');
        resetState();
    }

    const renderContent = () => {
        if (!platform) {
            return <PlatformSelector onPlatformSelect={handlePlatformSelect} />;
        }
        
        return (
            <>
                <div className="p-2">
                    <button onClick={() => setPlatform(null)} className="flex items-center gap-2 text-sm text-cyan-400 hover:text-cyan-200 p-2 rounded-md">
                        <ArrowLeftIcon className="w-5 h-5" />
                        Platform Seçimine Geri Dön
                    </button>
                </div>
                <main className="p-6 md:p-8 pt-0 grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <FileUpload 
                            label="1. Onarılacak 'critical_data' Yedeğini Yükle"
                            onFileSelect={handleFileSelect} 
                            disabled={isProcessing} 
                        />
                         {platform === 'mediatek' && (
                            <KeyProfileCreator 
                                onFileSelect={handleProfileCreation} 
                                disabled={isProcessing} 
                                profile={customProfile} 
                            />
                         )}
                        {platform === 'qualcomm' && (
                            <ModelSelector
                                platform={platform}
                                selectedProfile={selectedProfile}
                                onProfileChange={handleProfileChange}
                                disabled={isProcessing}
                            />
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <ImeiInput label="Yeni IMEI 1" imei={newImei1} onImeiChange={setNewImei1} isValid={isImei1Valid} disabled={isProcessing} />
                            <ImeiInput label="Yeni IMEI 2" imei={newImei2} onImeiChange={setNewImei2} isValid={isImei2Valid} disabled={isProcessing} />
                        </div>
                        <Disclaimer />
                    </div>

                    <div className="bg-gray-900/50 rounded-lg p-4 h-full min-h-[300px] flex flex-col">
                        <h3 className="text-lg font-semibold text-cyan-400 mb-2 border-b border-gray-700 pb-2">İşlem Günlüğü</h3>
                        <LogDisplay logs={logs} />
                    </div>
                </main>
                <footer className="p-6 bg-gray-900/40 border-t border-cyan-500/20 space-y-4 min-h-[95px] flex items-center justify-center">
                   {getFooterContent()}
                </footer>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-5xl bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl shadow-cyan-500/10 border border-cyan-500/20 overflow-hidden">
                <header className="p-6 border-b border-cyan-500/20 flex items-center gap-4 bg-gray-900/40">
                    <ChipIcon className="w-10 h-10 text-cyan-400" />
                    <div>
                        <h1 className="text-2xl font-bold text-cyan-400">Xiaomi Evrensel Onarım Yardımcısı</h1>
                        <p className="text-sm text-gray-400">Qualcomm & MediaTek Platformları İçin `critical_data` Onarımı</p>
                    </div>
                </header>
                {renderContent()}
            </div>
        </div>
    );
};

export default App;
