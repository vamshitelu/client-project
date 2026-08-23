import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  ResponseLite,
  RevenueGeneratingContractResponse,
} from '../models/RevenueSearchCriteria';
import responseLite from '../../../assets/data/response-lite.json';
import contractResponse from '../../../assets/data/revenueGeneratingContractList.json';

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

  getRevenueGeneratingContracts(): Observable<RevenueGeneratingContractResponse> {
    return of(contractResponse as RevenueGeneratingContractResponse);
  }

  search(criteria: RevenueSearchCriteria): RevenueSearchCriteria {
   // const url = 'https://testscor.hhs.state.tx.us/rgcontracts?
   // searchParams=agengy,isStartWith&searchParamValues=1,false&page=0&size=10';
   
    return { ...criteria };
  }
}
