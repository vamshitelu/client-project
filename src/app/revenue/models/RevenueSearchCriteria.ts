export class AgencyLookup {
  agencyId = '';
  agencyName = '';
  createdBy: string | null = null;
  updatedBy: string | null = null;
  createdDate: number | null = null;
  updatedDate: number | null = null;
  effectiveDate: number | null = null;
  expirationDate: number | null = null;
  disable = false;
}

export class DivisionLookup {
  divisionId = '';
  divisionName = '';
  agencyId = '';
  createdBy: string | null = null;
  updatedBy: string | null = null;
  createdDate: number | null = null;
  updatedDate: number | null = null;
  effectiveDate: number | null = null;
  expirationDate: number | null = null;
  disable = false;
}

export class DepartmentLookup {
  departmentId = '';
  departmentName = '';
  divisionId = '';
  createdBy: string | null = null;
  updatedBy: string | null = null;
  createdDate: number | null = null;
  updatedDate: number | null = null;
  effectiveDate: number | null = null;
  expirationDate: number | null = null;
  disable = false;
}

export class RgcStatusLookup {
  rgcStatusId = 0;
  rgcStatusName = '';
  createdBy: string | null = null;
  updatedBy: string | null = null;
  createdDate: number | null = null;
  updatedDate: number | null = null;
  effectiveDate: number | null = null;
  expirationDate: number | null = null;
  disable = false;
}

export class RevenueLeadLookup {
  userId = 0;
  userName = '';
  name = '';
  userAssigned = false;
  agencyName = '';
  scorUser = false;
  disable = false;
}

export class RgcDocumentTypeLookup {
  documentTypeId = '';
  documentTypeName = '';
  createdBy: string | null = null;
  updatedBy: string | null = null;
  documentNomenclatureFormat: string | null = null;
  createdDate: number | null = null;
  updatedDate: number | null = null;
  effectiveDate: number | null = null;
  expirationDate: number | null = null;
  formName: string | null = null;
  disable = false;
}

export class StateTypeLookup {
  stateId = 0;
  stateName = '';
  createdBy: string | null = null;
  updatedBy: string | null = null;
  createdDate: number | null = null;
  updatedDate: number | null = null;
  effectiveDate: number | null = null;
  expirationDate: number | null = null;
  disable = false;
}

export class SearchInitLoadResponse {
  agencyLookupList: AgencyLookup[] = [];
  divisionLookupList: DivisionLookup[] = [];
  departmentLookupList: DepartmentLookup[] = [];
  rgcStatusLookupList: RgcStatusLookup[] = [];
  revenueLeadLookupList: RevenueLeadLookup[] = [];
  rgcDocumentTypeLookupList: RgcDocumentTypeLookup[] = [];
  stateTypeLookupList: StateTypeLookup[] = [];
}

export interface RevenueGeneratingContractListItem {
  rgcId: number;
  rgcNumber: string;
  agency: string | null;
  division?: string | null;
  department?: string | null;
  entityName?: string;
  federalId?: string | null;
  revenueLead?: string | null;
  beginDate?: number | null;
  endDate?: number | null;
  status?: string | null;
  expectedRevenue?: number | null;
  objective?: string;
  comment?: string | null;
  lastUpdatedBy?: string | null;
  lastUpdatedDate?: number | null;
  currentFyRevenue?: number;
  totalRevenue?: number;
  permissions?: readonly unknown[];
}

export interface RevenueGeneratingContract {
  rgcId: number;
  rgcNumber: string;
  agency: AgencyLookup | null;
  division: DivisionLookup | null;
  department: DepartmentLookup | null;
  entityName: string;
  federalId: string | null;
  revenueLead: RevenueLeadLookup | null;
  beginDate: number | null;
  endDate: number | null;
  status: RgcStatusLookup | null;
  expectedRevenue: number | null;
  objective: string;
  comment: string | null;
  lastUpdatedBy: string | null;
  lastUpdatedDate: number | null;
  currentFyRevenue: number;
  totalRevenue: number;
  address1: string | null;
  address2: string | null;
  city: string | null;
  state: StateTypeLookup | null;
  zip: string | null;
  addressComment: string | null;
  phone: string | null;
  phoneExtension: string | null;
  revenueContractDocumentsUploaded: Array<{
    documentType: RgcDocumentTypeLookup | null;
    documentNames: Record<string, string> | null;
  }> | null;
  revenueContractDocumentsAttached: unknown[] | null;
  docsToBeDeletedForAudit: Record<string, unknown> | null;
  rgcRevenueDetailsList?: RevenueTakenInDetail[];
  permissions?: readonly unknown[];
}

export interface RevenueTakenInDetail {
  rgcRevenueId: number;
  number: number;
  rgcRevenueTakenIn: number | null;
  rgcRevenueDate: number | string| null;
  rgcInvoiceNumber: string;
  isNew?: boolean;
}

export interface RevenueGeneratingContractResponse {
  _embedded: {
    revenueGeneratingContractList: RevenueGeneratingContractListItem[];
  };
  page: {
    size: number;
    totalElements: number;
    totalPages: number;
    number: number;
  };
}
