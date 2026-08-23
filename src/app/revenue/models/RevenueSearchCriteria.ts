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

export class ResponseLite {
  agencyLookupList: AgencyLookup[] = [];
  divisionLookupList: DivisionLookup[] = [];
  departmentLookupList: DepartmentLookup[] = [];
  rgcStatusLookupList: RgcStatusLookup[] = [];
  revenueLeadLookupList: RevenueLeadLookup[] = [];
  rgcDocumentTypeLookupList: RgcDocumentTypeLookup[] = [];
  stateTypeLookupList: StateTypeLookup[] = [];
}
