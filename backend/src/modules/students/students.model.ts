export interface StudentModel {
  id: string;
  firstName: string;
  lastName: string;
  status: 'ACTIVE' | 'GRADUATED' | 'DROPPED' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
}

/** Enrollment of a student in a tenant (one student can have many). */
export interface StudentTenantModel {
  id: string;
  studentId: string;
  tenantId: string;
  indexNumber: string;
  programId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** Row returned by list (enrollment + person + tenant name). */
export interface StudentListItem {
  enrollmentId: string;
  studentId: string;
  tenantId: string;
  indexNumber: string;
  firstName: string;
  lastName: string;
  status: string;
  tenantName: string;
  programId: string | null;
}
