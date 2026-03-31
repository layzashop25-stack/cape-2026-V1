export type Gender = 'male' | 'female';

export type CaseType = 
  | 'violence'
  | 'addiction'
  | 'neglect'
  | 'exploitation'
  | 'family_issues'
  | 'other';

export type ProblemType = CaseType;

export type ViolenceType = 'physical' | 'sexual' | 'psychological' | 'social';
export type SubstanceType = 'cigarettes' | 'alcohol' | 'drugs' | 'glue' | 'none';
export type MedicalHistory = 'medical' | 'psychological' | 'other';

export interface Case {
  id: string;
  // معلومات أساسية
  fileNumber: string;
  completedBy: string;
  sender: string;
  reportSource: string;
  
  // معلومات الطفل
  firstName: string;
  lastName: string;
  birthDate: string;
  birthPlace: string;
  gender: Gender;
  civilRegistration: boolean;
  phone: string;
  
  // العائلة والتعليم
  siblingsCount: number;
  orderAmongSiblings: number;
  educationLevel: string;
  institution: string;
  stoppedSchool: boolean;
  schoolStopDate?: string;
  
  // الصحة والعادات
  socialCoverage: string;
  substances: SubstanceType[];
  medicalHistory: MedicalHistory[];
  
  // معلومات الأم
  motherFirstName: string;
  motherLastName: string;
  motherBirthDate: string;
  motherBirthPlace: string;
  motherNationalId: string;
  motherPhone: string;
  motherEducation: string;
  motherProfession: string;
  motherAddress: string;
  
  // معلومات الأب
  fatherFirstName: string;
  fatherLastName: string;
  fatherBirthDate: string;
  fatherBirthPlace: string;
  fatherNationalId: string;
  fatherPhone: string;
  fatherEducation: string;
  fatherProfession: string;
  fatherAddress: string;
  
  // الوضع العائلي
  parentsStatus: string;
  childLivingPlace: string;
  
  // معلومات المعنف
  abuserFirstName: string;
  abuserLastName: string;
  abuserAge: string;
  abuserNationalId: string;
  abuserPhone: string;
  abuserEducation: string;
  abuserProfession: string;
  abuserAddress: string;
  abuserRelation: string;
  
  // العنف
  violenceTypes: ViolenceType[];
  violenceNature: string;
  childStatement: string;
  childCondition: string;
  childRequests: string;
  notes: string;
  
  // Legacy fields
  name: string;
  age: number;
  problemType: ProblemType;
  date: string;
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  passwordHash: string;
}

export interface Database {
  version?: number;
  cases: Case[];
  users: User[];
  settings: {
    lastBackup?: string;
  };
  calendarEvents?: any[];
}

export interface MonthlyStats {
  month: string;
  total: number;
  boys: number;
  girls: number;
  problemsDistribution: Record<ProblemType, number>;
}

export interface YearlyStats {
  year: number;
  total: number;
  boys: number;
  girls: number;
  problemsDistribution: Record<ProblemType, number>;
  monthlyData: MonthlyStats[];
}
