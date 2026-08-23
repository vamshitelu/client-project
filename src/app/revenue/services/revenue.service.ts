import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ResponseLite } from '../models/RevenueSearchCriteria';
import responseLite from '../../../assets/data/response-lite.json';

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
  getDummyResponse(): Observable<ResponseLite> {
    // return this.http.get<ResponseLite>('assets/data/response-lite.json');
    return of(responseLite as ResponseLite);
  }

  search(criteria: RevenueSearchCriteria): RevenueSearchCriteria {
    return { ...criteria };
  }
}
