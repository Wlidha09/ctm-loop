
export type UserRole = 'Owner' | 'RH' | 'Manager' | 'Employee' | 'Dev';

export interface UserProfile {
  uid: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  displayName?: string;
  photoURL?: string;
  department?: string;
  birthDate?: string;
  officeDaysPerWeek?: number;
  onboarded: boolean;
  createdAt: any;
}
