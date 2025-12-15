
import React from 'react';
import { SelectorIcon } from './icons/SelectorIcon';
import { Platform } from '../App';

export const SIGNATURE_PROFILES = {
    // Qualcomm Profiles
    'qualcomm_profile_1': { 
        name: 'Qualcomm Profili #1 (Yaygın)',
        platform: 'qualcomm',
        data: {
            devPubKeyModulus: '8b9e34c788daea2a95f2bc383274a997bc432f520f1320059d6ff024292d50dec675d99dbcfba50bf422df0729c056903aaff5c6fb4605ed363402c5c15c6ec2cc6f5b5cd5ec1f760def3a114149217a85f2e7a82c8bf51b58686e032665a3916d556ae97b567f1bc15baecb657ffea66e7650bc00bbca4ec9ea76d46ea6367f',
            devPubKeyExponent: '10001',
            devPubKeySign: '054746C24F153459D1635867ED66A519D0107B0579EB76E459556ECE5B495B931B8CFE733F182291BE665516FD5CE9F49AE4EA550CBDA83BD45B67FD87CA03B29E6EAA116ED6F221DB2E40BACE7DA2E41374BA19A083B226E027D7F7798915E359DE68CC7403C8F41B237113E7E9EBACC331772DA57ADCB6FAF3AC061C85F50BCA43197AE76E8103EE7C0ED40C4F1A3CA80C42095C6FABD91A3C8CEBBFC16D46AF9ImeI1f8E58585BA7F440CDCDF0F3FB5FDD4A837E68E99ED69B4AE17F679C5543AF811AC29B0119B9CA4BAE45F8778F9F48738E7E32AD0AC92BDF5BCA810D841A1527B38FB79CC30C2FBEA9B9D3794D3A5D18AEBCED666CFD359CE6269F486738',
            crticalDataSign: '7ee3be5a72bcc39749ff682bb22d92cb3ac166bfb1271f48ab9e16f7642c2c1d7a5c2142a14bce0d1a6e700a7075b838563059d3a0f6de73fc62a41f2bcec76e907b3d26010ce27dd3a8e6a9754ac0bda1be6f249055a5ae4d112a0fd2081f95b8191feb084e098f8db9011d5f1d6cc10b0d1d419c3e5929d0432014611cd2de'
        }
    },
    'qualcomm_profile_2': { 
        name: 'Qualcomm Profili #2 (Alternatif)',
        platform: 'qualcomm',
        data: {
            devPubKeyModulus: 'b87035cc66c7d6da029ea5bc042f349d5e9e5bd08b1bbe583a964e9b2059f6a9137586ffed3a3c3f230b2f6c1dd9d92c86c180b54de2cd5f04c8e6be74dd6aff536412a8b6bfdb1a14a9cd99962f38b4e323cb3c685716eebe965257132b3035f23d021d8c1793f8d6f8b09efaa51114ef60a2252797e1d28035a539aa55c14f',
            devPubKeyExponent: '10001',
            devPubKeySign: '49BEE3D78B81BD5FEC1A9F8E8CFEC0468BD1C06A523184377ED549A4F74B24205CF77C906571DE793570686EEB0FC71F97F273E985FB17B147D1A494E1679723C83E3FB6891EE1B815513DA6523E0135F5F990B2B8EBA43FB87B33E18A15D139349E233659F409C2D4E6F077BAF90F4ED7457CA1C2CFF6AEF16716BF667543F89BCFC3402B6FD3F21E940E51AB5FD2790E8B383A27AB14DB39E5FAD62E654995FA6D1FC8631018AFCE591578C8CD4E15F5F805EE4954EA5950B183D9B432B27AEA72FE003ACEE8E6016FD19B570843E0B2018C840414B212CEC7DF025434CB336B19E8720245A84C7CB17F501722E87FB679A865E64B7F3161B7DD8F52E1127F',
            crticalDataSign: '53c559b769af2296f8e0dfd03d4781a98338a731eefd91c60710719df65f06d960970de9b861cb7bd1a77ba0cbad1a9f385e282ce3a7c64f5559864118935ad58aa48563b1103c4fcf1f0ad9e6b371f65e0eaf2aa95c714a579b96c703d129e4b571ac0448a145f5d57ef00a57a9a759624f26547d9edd2617c2dcfb63267021'
        }
    },
    // Universal Profile
    'custom': {
        name: 'Özel Profil (Gelişmiş)',
        platform: 'universal', // Belongs to both
        data: null
    }
};

type ProfileKey = keyof typeof SIGNATURE_PROFILES;
interface ModelSelectorProps {
    platform: Platform;
    selectedProfile: ProfileKey | '';
    onProfileChange: (value: ProfileKey | '') => void;
    disabled: boolean;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ platform, selectedProfile, onProfileChange, disabled }) => {
    const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onProfileChange(event.target.value as ProfileKey);
    };

    const filteredProfiles = Object.entries(SIGNATURE_PROFILES).filter(([key, profile]) => {
        return profile.platform === platform || profile.platform === 'universal';
    });

    return (
        <div className="space-y-2">
            <label htmlFor="model-selector" className="block text-sm font-medium text-gray-300">
                2. Cihaz Profili Seç <span className="text-red-400">(ÖNEMLİ)</span>
            </label>
            <div className="relative">
                <select
                    id="model-selector"
                    value={selectedProfile}
                    onChange={handleChange}
                    disabled={disabled}
                    className={`block w-full appearance-none px-4 py-3 bg-gray-900/70 border rounded-md shadow-sm 
                        focus:outline-none focus:ring-2 transition-all text-lg
                        ${!selectedProfile ? 'border-gray-600 text-gray-500 focus:ring-cyan-500 focus:border-cyan-500' : 'border-cyan-500 text-gray-200'}
                        ${disabled ? 'cursor-not-allowed bg-gray-700/50' : ''}
                    `}
                >
                    <option value="" disabled>Bir profil seçin...</option>
                    {filteredProfiles.map(([key, profile]) => (
                        <option key={key} value={key}>{profile.name}</option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <SelectorIcon className="h-5 w-5" />
                </div>
            </div>
             <p className="text-xs text-gray-500">Yanlış profil seçimi NV DATA HATASINA veya cihazın çökmesine neden olabilir. Emin değilseniz Profili #1'i deneyin.</p>
        </div>
    );
};
