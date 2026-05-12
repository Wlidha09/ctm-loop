
export type UserRole = 'Dev' | 'Owner' | 'RH' | 'Manager' | 'Employé';

export interface UserProfile {
  uid: string;
  email: string;
  companyId: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  displayName?: string;
  photoURL?: string;
  department?: string;
  officeDaysPerWeek?: number;
  baseSalary?: number;
  onboarded: boolean;
  createdAt: any;
}

export interface Company {
  id: string;
  name: string;
  createdAt: any;
}
