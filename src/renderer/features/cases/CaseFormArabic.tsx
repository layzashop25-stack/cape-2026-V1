import { useState, FormEvent } from 'react';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { db } from '@/services/database';
import type { Gender, ViolenceType, SubstanceType, MedicalHistory, CaseType } from '@/types';
import { FileText, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

export function CaseFormArabic({ onSuccess }: { onSuccess?: () => void }) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    fileNumber: '',
    completedBy: '',
    sender: '',
    reportSource: '',
    caseType: 'violence' as CaseType,
    firstName: '',
    lastName: '',
    birthDate: '',
    birthPlace: '',
    gender: 'male' as Gender,
    civilRegistration: true,
    phone: '',
    siblingsCount: 0,
    orderAmongSiblings: 0,
    educationLevel: '',
    institution: '',
    stoppedSchool: false,
    schoolStopDate: '',
    socialCoverage: '',
    substances: [] as SubstanceType[],
    medicalHistory: [] as MedicalHistory[],
    motherFirstName: '',
    motherLastName: '',
    motherBirthDate: '',
    motherBirthPlace: '',
    motherNationalId: '',
    motherPhone: '',
    motherEducation: '',
    motherProfession: '',
    motherAddress: '',
    fatherFirstName: '',
    fatherLastName: '',
    fatherBirthDate: '',
    fatherBirthPlace: '',
    fatherNationalId: '',
    fatherPhone: '',
    fatherEducation: '',
    fatherProfession: '',
    fatherAddress: '',
    parentsStatus: '',
    childLivingPlace: '',
    abuserFirstName: '',
    abuserLastName: '',
    abuserAge: '',
    abuserNationalId: '',
    abuserPhone: '',
    abuserEducation: '',
    abuserProfession: '',
    abuserAddress: '',
    abuserRelation: '',
    violenceTypes: [] as ViolenceType[],
    violenceNature: '',
    abuserViolenceType: '',
    abuserNote: '',
    childStatement: '',
    childCondition: '',
    childRequests: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCheckbox = (field: 'substances' | 'medicalHistory' | 'violenceTypes', value: any) => {
    const current = formData[field] as any[];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const birthDate = new Date(formData.birthDate);
      const age = new Date().getFullYear() - birthDate.getFullYear();
      
      await db.addCase({
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`,
        age,
        problemType: formData.caseType,
        date: new Date().toISOString().split('T')[0]
      } as any);
      
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-slide-up" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {showSuccess && (
        <div className="mb-6 p-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-xl shadow-lg flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-6 h-6" />
          <span className="font-semibold">{t.savedSuccessfully} ✅</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-8 card-hover">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t.newFile}</h2>
        </div>

        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 border-r-4 border-blue-500 pr-3">{t.basicInfo}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.fileNumber} value={formData.fileNumber} onChange={e => setFormData({...formData, fileNumber: e.target.value})} required />
            <Input label={t.completedBy} value={formData.completedBy} onChange={e => setFormData({...formData, completedBy: e.target.value})} required />
            <Input label={t.sender} value={formData.sender} onChange={e => setFormData({...formData, sender: e.target.value})} />
            <Input label={t.reportSource} value={formData.reportSource} onChange={e => setFormData({...formData, reportSource: e.target.value})} />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.caseType}</label>
            <select 
              value={formData.caseType} 
              onChange={e => setFormData({...formData, caseType: e.target.value as CaseType})}
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
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 border-r-4 border-green-500 pr-3">{t.childInfo}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.firstName} value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} required />
            <Input label={t.lastName} value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} required />
            <Input label={t.birthDate} type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} required />
            <Input label={t.birthPlace} value={formData.birthPlace} onChange={e => setFormData({...formData, birthPlace: e.target.value})} />
            <Select label={t.genderLabel} options={[{value:'male',label:t.male},{value:'female',label:t.female}]} value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as Gender})} />
            <Input label={t.phone} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.civilRegistration} onChange={e => setFormData({...formData, civilRegistration: e.target.checked})} className="w-5 h-5" />
              <span>{t.civilRegistration}</span>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input label={t.siblingsCount} type="number" value={formData.siblingsCount} onChange={e => setFormData({...formData, siblingsCount: parseInt(e.target.value)||0})} />
            <Input label={t.orderAmongSiblings} type="number" value={formData.orderAmongSiblings} onChange={e => setFormData({...formData, orderAmongSiblings: parseInt(e.target.value)||0})} />
            <Input label={t.educationLevel} value={formData.educationLevel} onChange={e => setFormData({...formData, educationLevel: e.target.value})} />
          </div>

          <Input label={t.institution} value={formData.institution} onChange={e => setFormData({...formData, institution: e.target.value})} />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={formData.stoppedSchool} onChange={e => setFormData({...formData, stoppedSchool: e.target.checked})} className="w-5 h-5" />
              <span>{t.stoppedSchool}</span>
            </label>
            {formData.stoppedSchool && (
              <Input label={t.schoolStopDate} type="date" value={formData.schoolStopDate} onChange={e => setFormData({...formData, schoolStopDate: e.target.value})} />
            )}
          </div>

          <Input label={t.socialCoverage} value={formData.socialCoverage} onChange={e => setFormData({...formData, socialCoverage: e.target.value})} />

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.harmfulHabits}</label>
            <div className="flex flex-wrap gap-4">
              {[{v:'cigarettes',l:t.cigarettes},{v:'alcohol',l:t.alcohol},{v:'drugs',l:t.drugs},{v:'glue',l:t.glue},{v:'none',l:t.noSubstances}].map(s => (
                <label key={s.v} className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.substances.includes(s.v as SubstanceType)} onChange={() => handleCheckbox('substances', s.v)} className="w-5 h-5" />
                  <span>{s.l}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.medicalHistoryLabel}</label>
            <div className="flex gap-4">
              {[{v:'medical',l:t.medical},{v:'psychological',l:t.psychological},{v:'other',l:t.other}].map(h => (
                <label key={h.v} className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.medicalHistory.includes(h.v as MedicalHistory)} onChange={() => handleCheckbox('medicalHistory', h.v)} className="w-5 h-5" />
                  <span>{h.l}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Mother Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 border-r-4 border-pink-500 pr-3">{t.motherInfo}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.firstName} value={formData.motherFirstName} onChange={e => setFormData({...formData, motherFirstName: e.target.value})} />
            <Input label={t.lastName} value={formData.motherLastName} onChange={e => setFormData({...formData, motherLastName: e.target.value})} />
            <Input label={t.birthDate} type="date" value={formData.motherBirthDate} onChange={e => setFormData({...formData, motherBirthDate: e.target.value})} />
            <Input label={t.birthPlace} value={formData.motherBirthPlace} onChange={e => setFormData({...formData, motherBirthPlace: e.target.value})} />
            <Input label={t.nationalId} value={formData.motherNationalId} onChange={e => setFormData({...formData, motherNationalId: e.target.value})} />
            <Input label={t.phone} value={formData.motherPhone} onChange={e => setFormData({...formData, motherPhone: e.target.value})} />
            <Input label={t.educationLevel} value={formData.motherEducation} onChange={e => setFormData({...formData, motherEducation: e.target.value})} />
            <Input label={t.profession} value={formData.motherProfession} onChange={e => setFormData({...formData, motherProfession: e.target.value})} />
          </div>
          <Input label={t.address} value={formData.motherAddress} onChange={e => setFormData({...formData, motherAddress: e.target.value})} />
        </div>

        {/* Father Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 border-r-4 border-blue-500 pr-3">{t.fatherInfo}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.firstName} value={formData.fatherFirstName} onChange={e => setFormData({...formData, fatherFirstName: e.target.value})} />
            <Input label={t.lastName} value={formData.fatherLastName} onChange={e => setFormData({...formData, fatherLastName: e.target.value})} />
            <Input label={t.birthDate} type="date" value={formData.fatherBirthDate} onChange={e => setFormData({...formData, fatherBirthDate: e.target.value})} />
            <Input label={t.birthPlace} value={formData.fatherBirthPlace} onChange={e => setFormData({...formData, fatherBirthPlace: e.target.value})} />
            <Input label={t.nationalId} value={formData.fatherNationalId} onChange={e => setFormData({...formData, fatherNationalId: e.target.value})} />
            <Input label={t.phone} value={formData.fatherPhone} onChange={e => setFormData({...formData, fatherPhone: e.target.value})} />
            <Input label={t.educationLevel} value={formData.fatherEducation} onChange={e => setFormData({...formData, fatherEducation: e.target.value})} />
            <Input label={t.profession} value={formData.fatherProfession} onChange={e => setFormData({...formData, fatherProfession: e.target.value})} />
          </div>
          <Input label={t.address} value={formData.fatherAddress} onChange={e => setFormData({...formData, fatherAddress: e.target.value})} />
        </div>

        {/* Family Status */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.parentsStatus} value={formData.parentsStatus} onChange={e => setFormData({...formData, parentsStatus: e.target.value})} />
            <Input label={t.childLivingPlace} value={formData.childLivingPlace} onChange={e => setFormData({...formData, childLivingPlace: e.target.value})} />
          </div>
        </div>

        {/* Abuser Info */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 border-r-4 border-red-500 pr-3">{t.abuserInfo}</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label={t.firstName} value={formData.abuserFirstName} onChange={e => setFormData({...formData, abuserFirstName: e.target.value})} />
            <Input label={t.lastName} value={formData.abuserLastName} onChange={e => setFormData({...formData, abuserLastName: e.target.value})} />
            <Input label={t.ageApprox} value={formData.abuserAge} onChange={e => setFormData({...formData, abuserAge: e.target.value})} />
            <Input label={t.nationalId} value={formData.abuserNationalId} onChange={e => setFormData({...formData, abuserNationalId: e.target.value})} />
            <Input label={t.phone} value={formData.abuserPhone} onChange={e => setFormData({...formData, abuserPhone: e.target.value})} />
            <Input label={t.educationLevel} value={formData.abuserEducation} onChange={e => setFormData({...formData, abuserEducation: e.target.value})} />
            <Input label={t.profession} value={formData.abuserProfession} onChange={e => setFormData({...formData, abuserProfession: e.target.value})} />
            <Input label={t.relationToChild} value={formData.abuserRelation} onChange={e => setFormData({...formData, abuserRelation: e.target.value})} />
          </div>
          <Input label={t.address} value={formData.abuserAddress} onChange={e => setFormData({...formData, abuserAddress: e.target.value})} />
          
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.violenceType}</label>
            <textarea className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none" rows={2} value={formData.abuserViolenceType} onChange={e => setFormData({...formData, abuserViolenceType: e.target.value})} />
          </div>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.note}</label>
            <textarea className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none" rows={3} value={formData.abuserNote} onChange={e => setFormData({...formData, abuserNote: e.target.value})} />
          </div>
        </div>

        {/* Child Statement */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 border-r-4 border-orange-500 pr-3">{t.childStatement}</h3>
          
          <div>
            <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.violenceNature}</label>
            <div className="flex gap-4">
              {[{v:'physical',l:t.physical},{v:'sexual',l:t.sexual},{v:'psychological',l:t.psychologicalViolence},{v:'social',l:t.social}].map(vt => (
                <label key={vt.v} className="flex items-center gap-2">
                  <input type="checkbox" checked={formData.violenceTypes.includes(vt.v as ViolenceType)} onChange={() => handleCheckbox('violenceTypes', vt.v)} className="w-5 h-5" />
                  <span>{vt.l}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.childCondition}</label>
              <textarea className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none" rows={3} value={formData.childCondition} onChange={e => setFormData({...formData, childCondition: e.target.value})} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">{t.childRequests}</label>
              <textarea className="w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 resize-none" rows={3} value={formData.childRequests} onChange={e => setFormData({...formData, childRequests: e.target.value})} />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
          {isSubmitting ? `⏳ ${t.saving}` : `✅ ${t.saveFile}`}
        </Button>
      </form>
    </div>
  );
}
