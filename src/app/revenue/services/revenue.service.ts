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
    const candidateFields: Array<[string, string | boolean]> = [
      ['rgcId', criteria.rgcId],
      ['entityName', criteria.entityName],
      ['federalId', criteria.federalId],
      ['agency', criteria.agencyId],
      ['division', criteria.division],
      ['department', criteria.department],
      ['rgcStatus', criteria.rgcStatus],
      ['revenueLead', criteria.revenueLead],
    ];
    const searchFields = candidateFields.filter(([, value]) => value !== '');

    if (criteria.beginDate) {
      searchFields.push(['beginDateOperator', criteria.beginDateOperator], ['beginDate', criteria.beginDate]);
    }

    if (criteria.endDate) {
      searchFields.push(['endDateOperator', criteria.endDateOperator], ['endDate', criteria.endDate]);
    }

    if (criteria.amount) {
      searchFields.push(['totalRevenueOperator', criteria.totalRevenueOperator], ['amount', criteria.amount]);
    }

    searchFields.push(['isStartsWith', criteria.startsWith]);

    const params = new HttpParams()
      .set('searchParams', searchFields.map(([key]) => key).join(','))
      .set('searchParamValues', searchFields.map(([, value]) => value).join(','))
      .set('page', page)
      .set('size', size);

    return this.http.get<RevenueGeneratingContractResponse>(
      "scor/rgcontract",
      { params },
    );
  }

  getRevenueContractDetail(rgcId: number): Observable<RevenueGeneratingContract | null> {
    return this.http.get<RevenueGeneratingContract>(`scor/rgcontracts/${rgcId}`);
  }

  updateRevenueContract(contract: RevenueGeneratingContract): Observable<RevenueGeneratingContract | null> {
    return this.http.post<RevenueGeneratingContract | null>(`scor/rgcontracts/${contract.rgcId}`, contract);
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
