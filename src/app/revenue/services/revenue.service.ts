import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import {
  SearchInitLoadResponse,
  RevenueTakenInDetail,
  RevenueGeneratingContract,
  RevenueGeneratingContractListItem,
  RevenueGeneratingContractResponse,
} from '../models/RevenueSearchCriteria';

import contractResponse from '../../../assets/data/revenueGeneratingContractList.json';
import contractDetails from '../../../assets/data/100000001.json';


export interface RevenueSearchCriteria {
  rgcId: string;
  entityName: string;
  federalId: string;
  agency: string;
  agencyId: string;
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
  private readonly http = inject(HttpClient);
  

  getSearchInitLoad(): Observable<SearchInitLoadResponse> {
    return this.http.get<SearchInitLoadResponse>(
      "scor/lookups/rgc"
    );
  }


  getRevenueGeneratingContracts(
    criteria: RevenueSearchCriteria,
    page = 0,
    size = 10,
  ): Observable<RevenueGeneratingContractResponse> {
    const params = new HttpParams()
      .set('searchParams', 'agency,isStartsWith')
      .set('searchParamValues', `${criteria.agencyId},${criteria.startsWith}`)
      .set('page', page)
      .set('size', size);

    return this.http.get<RevenueGeneratingContractResponse>(
      "scor/rgcontract",
      { params },
    );
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
