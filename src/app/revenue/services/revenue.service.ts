import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  ResponseLite,
  RevenueTakenInDetail,
  RevenueGeneratingContract,
  RevenueGeneratingContractListItem,
  RevenueGeneratingContractResponse,
} from '../models/RevenueSearchCriteria';
import responseLite from '../../../assets/data/response-lite.json';
import contractResponse from '../../../assets/data/revenueGeneratingContractList.json';
import contractDetails from '../../../assets/data/100000001.json';

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
    return of(contractResponse as unknown as RevenueGeneratingContractResponse);
  }

  getRevenueContractDetail(rgcId: number): Observable<RevenueGeneratingContract | null> {
    const detail = (contractDetails as RevenueGeneratingContract);
    return of(rgcId === detail.rgcId ? detail : null);
  }

  getRevenueTakenInDetails(rgcId: number): Observable<readonly RevenueTakenInDetail[]> {
    return of(rgcId === contractDetails.rgcId ? contractDetails.rgcRevenueDetailsList : []);
  }

  search(criteria: RevenueSearchCriteria): RevenueSearchCriteria {
   // const url = 'https://testscor.hhs.state.tx.us/rgcontracts?
   // searchParams=agengy,isStartWith&searchParamValues=1,false&page=0&size=10';
   
    return { ...criteria };
  }
}
