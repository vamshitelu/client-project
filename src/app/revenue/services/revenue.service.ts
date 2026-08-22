import { Injectable } from '@angular/core';

export interface RevenueSearchCriteria {
  rgcId: string;
  entityName: string;
  federalId: string;
  agency: string;
  division: string;
  department: string;
  rgcStatus: string;
  revenueLead: string;
  beginDateOperator: string;
  beginDate: string;
  endDateOperator: string;
  endDate: string;
  totalRevenueOperator: string;
  amount: string;
  startsWith: boolean;
}

@Injectable({ providedIn: 'root' })
export class RevenueService {
  retrieveAgencies(): readonly string[] {
    return ['Agency A', 'Agency B'];
  }

  retrieveDivisions(): readonly string[] {
    return ['Division A', 'Division B'];
  }

  retrieveDepartments(): readonly string[] {
    return ['Department A', 'Department B'];
  }

  retrieveRgcStatuses(): readonly string[] {
    return ['Active', 'Inactive'];
  }

  retrieveRevenueLeads(): readonly string[] {
    return ['Lead A', 'Lead B'];
  }

  search(criteria: RevenueSearchCriteria): RevenueSearchCriteria {
    return { ...criteria };
  }
}
