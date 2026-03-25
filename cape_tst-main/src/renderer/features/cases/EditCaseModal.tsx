import { useState } from 'react';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { X } from 'lucide-react';
import type { Case, Gender, ViolenceType, CaseType } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

interface EditCaseModalProps {
  caseData: Case;
  onClose: () => void;
  onSave: (updatedCase: Case) => void;
}

export function EditCaseModal({ caseData, onClose, onSave }: EditCaseModalProps) {
  const [editedCase, setEditedCase] = useState<Case>(caseData);
  const { t, language } = useLanguage();

  const handleCheckbox = (field: 'violenceTypes', value: ViolenceType) => {
    const current = editedCase[field] as ViolenceType[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setEditedCase({ ...editedCase, [field]: updated });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="glass rounded-2xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()} dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-slate-800">{t.editCase || 'تعديل الحالة / Edit Case'}</h3>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <h4 className="text-lg font-bold text-slate-700 mb-3 border-r-4 border-blue-500 pr-3">{t.basicInfo}</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t.fileNumber} value={editedCase.fileNumber} onChange={e => setEditedCase({...editedCase, fileNumber: e.target.value})} />
              <Input label={t.completedBy} value={editedCase.completedBy} onChange={e => setEditedCase({...editedCase, completedBy: e.target.value})} />
              <Input label={t.sender} value={editedCase.sender} onChange={e => setEditedCase({...editedCase, sender: e.target.value})} />
              <Input label={t.reportSource} value={editedCase.reportSource} onChange={e => setEditedCase({...editedCase, reportSource: e.target.value})} />
            </div>
            
            <div className="mt-4">
              <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.caseType}</label>
              <select 
                value={editedCase.problemType} 
                onChange={e => setEditedCase({...editedCase, problemType: e.target.value as CaseType})}
                className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              >
                <option value="violence">{t.caseTypeViolence}</option>
                <option value="addiction">{t.caseTypeAddiction}</option>
                <option value="neglect">{t.caseTypeNeglect}</option>
                <option value="exploitation">{t.caseTypeExploitation}</option>
                <option value="family_issues">{t.caseTypeFamilyIssues}</option>
                <option value="other">{t.caseTypeOther}</option>
              </select>
            </div>
          </div>

          {/* Child Info */}
          <div>
            <h4 className="text-lg font-bold text-slate-700 mb-3 border-r-4 border-green-500 pr-3">{t.childInfo}</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t.firstName} value={editedCase.firstName} onChange={e => setEditedCase({...editedCase, firstName: e.target.value})} />
              <Input label={t.lastName} value={editedCase.lastName} onChange={e => setEditedCase({...editedCase, lastName: e.target.value})} />
              <Input label={t.birthDate} type="date" value={editedCase.birthDate} onChange={e => setEditedCase({...editedCase, birthDate: e.target.value})} />
              <Input label={t.birthPlace} value={editedCase.birthPlace} onChange={e => setEditedCase({...editedCase, birthPlace: e.target.value})} />
              <Select label={t.genderLabel} options={[{value:'male',label:t.male},{value:'female',label:t.female}]} value={editedCase.gender} onChange={e => setEditedCase({...editedCase, gender: e.target.value as Gender})} />
              <Input label={t.phone} value={editedCase.phone} onChange={e => setEditedCase({...editedCase, phone: e.target.value})} />
              <Input label={t.siblingsCount} type="number" value={editedCase.siblingsCount} onChange={e => setEditedCase({...editedCase, siblingsCount: parseInt(e.target.value)||0})} />
              <Input label={t.orderAmongSiblings} type="number" value={editedCase.orderAmongSiblings} onChange={e => setEditedCase({...editedCase, orderAmongSiblings: parseInt(e.target.value)||0})} />
              <Input label={t.educationLevel} value={editedCase.educationLevel} onChange={e => setEditedCase({...editedCase, educationLevel: e.target.value})} />
              <Input label={t.institution} value={editedCase.institution} onChange={e => setEditedCase({...editedCase, institution: e.target.value})} />
              <Input label={t.socialCoverage} value={editedCase.socialCoverage} onChange={e => setEditedCase({...editedCase, socialCoverage: e.target.value})} />
            </div>
          </div>

          {/* Mother Info */}
          <div>
            <h4 className="text-lg font-bold text-slate-700 mb-3 border-r-4 border-pink-500 pr-3">{t.motherInfo}</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t.firstName} value={editedCase.motherFirstName} onChange={e => setEditedCase({...editedCase, motherFirstName: e.target.value})} />
              <Input label={t.lastName} value={editedCase.motherLastName} onChange={e => setEditedCase({...editedCase, motherLastName: e.target.value})} />
              <Input label={t.birthDate} type="date" value={editedCase.motherBirthDate} onChange={e => setEditedCase({...editedCase, motherBirthDate: e.target.value})} />
              <Input label={t.birthPlace} value={editedCase.motherBirthPlace} onChange={e => setEditedCase({...editedCase, motherBirthPlace: e.target.value})} />
              <Input label={t.nationalId} value={editedCase.motherNationalId} onChange={e => setEditedCase({...editedCase, motherNationalId: e.target.value})} />
              <Input label={t.phone} value={editedCase.motherPhone} onChange={e => setEditedCase({...editedCase, motherPhone: e.target.value})} />
              <Input label={t.educationLevel} value={editedCase.motherEducation} onChange={e => setEditedCase({...editedCase, motherEducation: e.target.value})} />
              <Input label={t.profession} value={editedCase.motherProfession} onChange={e => setEditedCase({...editedCase, motherProfession: e.target.value})} />
            </div>
            <Input label={t.address} value={editedCase.motherAddress} onChange={e => setEditedCase({...editedCase, motherAddress: e.target.value})} className="mt-4" />
          </div>

          {/* Father Info */}
          <div>
            <h4 className="text-lg font-bold text-slate-700 mb-3 border-r-4 border-blue-500 pr-3">{t.fatherInfo}</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t.firstName} value={editedCase.fatherFirstName} onChange={e => setEditedCase({...editedCase, fatherFirstName: e.target.value})} />
              <Input label={t.lastName} value={editedCase.fatherLastName} onChange={e => setEditedCase({...editedCase, fatherLastName: e.target.value})} />
              <Input label={t.birthDate} type="date" value={editedCase.fatherBirthDate} onChange={e => setEditedCase({...editedCase, fatherBirthDate: e.target.value})} />
              <Input label={t.birthPlace} value={editedCase.fatherBirthPlace} onChange={e => setEditedCase({...editedCase, fatherBirthPlace: e.target.value})} />
              <Input label={t.nationalId} value={editedCase.fatherNationalId} onChange={e => setEditedCase({...editedCase, fatherNationalId: e.target.value})} />
              <Input label={t.phone} value={editedCase.fatherPhone} onChange={e => setEditedCase({...editedCase, fatherPhone: e.target.value})} />
              <Input label={t.educationLevel} value={editedCase.fatherEducation} onChange={e => setEditedCase({...editedCase, fatherEducation: e.target.value})} />
              <Input label={t.profession} value={editedCase.fatherProfession} onChange={e => setEditedCase({...editedCase, fatherProfession: e.target.value})} />
            </div>
            <Input label={t.address} value={editedCase.fatherAddress} onChange={e => setEditedCase({...editedCase, fatherAddress: e.target.value})} className="mt-4" />
          </div>

          {/* Family Status */}
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.parentsStatus} value={editedCase.parentsStatus} onChange={e => setEditedCase({...editedCase, parentsStatus: e.target.value})} />
            <Input label={t.childLivingPlace} value={editedCase.childLivingPlace} onChange={e => setEditedCase({...editedCase, childLivingPlace: e.target.value})} />
          </div>

          {/* Abuser Info */}
          <div>
            <h4 className="text-lg font-bold text-slate-700 mb-3 border-r-4 border-red-500 pr-3">{t.abuserInfo}</h4>
            <div className="grid grid-cols-2 gap-4">
              <Input label={t.firstName} value={editedCase.abuserFirstName} onChange={e => setEditedCase({...editedCase, abuserFirstName: e.target.value})} />
              <Input label={t.lastName} value={editedCase.abuserLastName} onChange={e => setEditedCase({...editedCase, abuserLastName: e.target.value})} />
              <Input label={t.ageApprox} value={editedCase.abuserAge} onChange={e => setEditedCase({...editedCase, abuserAge: e.target.value})} />
              <Input label={t.nationalId} value={editedCase.abuserNationalId} onChange={e => setEditedCase({...editedCase, abuserNationalId: e.target.value})} />
              <Input label={t.phone} value={editedCase.abuserPhone} onChange={e => setEditedCase({...editedCase, abuserPhone: e.target.value})} />
              <Input label={t.educationLevel} value={editedCase.abuserEducation} onChange={e => setEditedCase({...editedCase, abuserEducation: e.target.value})} />
              <Input label={t.profession} value={editedCase.abuserProfession} onChange={e => setEditedCase({...editedCase, abuserProfession: e.target.value})} />
              <Input label={t.relationToChild} value={editedCase.abuserRelation} onChange={e => setEditedCase({...editedCase, abuserRelation: e.target.value})} />
            </div>
            <Input label={t.address} value={editedCase.abuserAddress} onChange={e => setEditedCase({...editedCase, abuserAddress: e.target.value})} className="mt-4" />
          </div>

          {/* Violence Info */}
          <div>
            <h4 className="text-lg font-bold text-slate-700 mb-3 border-r-4 border-orange-500 pr-3">{t.childStatement}</h4>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.violenceNature}</label>
              <div className="flex gap-4 mb-3">
                {[{v:'physical',l:t.physical},{v:'sexual',l:t.sexual},{v:'psychological',l:t.psychologicalViolence},{v:'social',l:t.social}].map(vt => (
                  <label key={vt.v} className="flex items-center gap-2">
                    <input type="checkbox" checked={editedCase.violenceTypes.includes(vt.v as ViolenceType)} onChange={() => handleCheckbox('violenceTypes', vt.v as ViolenceType)} className="w-5 h-5" />
                    <span>{vt.l}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.childCondition}</label>
                <textarea className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" rows={3} value={editedCase.childCondition} onChange={e => setEditedCase({...editedCase, childCondition: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.childRequests}</label>
                <textarea className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none" rows={3} value={editedCase.childRequests} onChange={e => setEditedCase({...editedCase, childRequests: e.target.value})} />
              </div>
            </div>
          </div>

          <Button onClick={() => onSave(editedCase)} className="w-full" size="lg">
            ✅ {t.saveFile}
          </Button>
        </div>
      </div>
    </div>
  );
}
