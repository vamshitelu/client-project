import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TableShellHeaderComponent } from '../../shared/components/data-table/table-shell-header/table-shell-header.component';
import {
  AgencyLookup,
  ResponseLite,
  RevenueGeneratingContract,
} from '../models/RevenueSearchCriteria';
import { RevenueService } from '../services/revenue.service';

@Component({
  selector: 'app-revenue',
  imports: [ReactiveFormsModule, DatePipe, TableShellHeaderComponent],
  templateUrl: './revenue.html',
  styleUrl: './revenue.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Revenue implements OnInit {
  private readonly formBuilder = new FormBuilder().nonNullable;
  private readonly revenueService = inject(RevenueService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected readonly searchSubmitted = signal(false);
  protected agencies: readonly AgencyLookup[] = [];
  protected divisions: readonly string[] = [];
  protected departments: readonly string[] = [];
  protected rgcStatuses: readonly string[] = [];
  protected revenueLeads: readonly string[] = [];
  protected readonly searchResults = signal<readonly RevenueGeneratingContract[]>([]);
  protected readonly totalResults = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly currentPage = signal(1);

  ngOnInit(): void {
    this.revenueService.getDummyResponse().subscribe((response: ResponseLite) => {
      this.assignDropdownOptions(response);
    });
  }

  private assignDropdownOptions(response: ResponseLite): void {
    this.agencies = response.agencyLookupList;
    this.divisions = response.divisionLookupList.map((division) => division.divisionName);
    this.departments = response.departmentLookupList.map((department) => department.departmentName);
    this.rgcStatuses = response.rgcStatusLookupList.map((status) => status.rgcStatusName);
    this.revenueLeads = response.revenueLeadLookupList.map((lead) => lead.name);
    this.changeDetector.markForCheck();
  }

  protected readonly searchForm = this.formBuilder.group({
    rgcId: [''], entityName: [''], federalId: [''], agency: [''], agencyId: [''], division: [''],
    department: [''], rgcStatus: [''], revenueLead: [''], beginDateOperator: ['After'],
    beginDate: [''], endDateOperator: ['After'], endDate: [''],
    totalRevenueOperator: ['Equal to'], amount: [''], startsWith: [false],
  });

  protected agencyChanged(agencyName: string): void {
    const selectedAgency = this.agencies.find((agency) => agency.agencyName === agencyName);
    this.searchForm.controls.agencyId.setValue(selectedAgency?.agencyId ?? '');
  }

  protected search(): void {
    const criteria = this.searchForm.getRawValue();
    console.log('Revenue search request:', criteria);
    this.revenueService.search(criteria);
    this.revenueService.getRevenueGeneratingContracts().subscribe((response) => {
      this.searchResults.set(response._embedded.revenueGeneratingContractList);
      this.totalResults.set(response.page.totalElements);
      this.currentPage.set(response.page.number + 1);
    });
    this.searchSubmitted.set(true);
  }

  protected pageSizeChanged(size: number): void {
    this.pageSize.set(size);
    this.currentPage.set(1);
  }

  protected pageChanged(page: number): void {
    this.currentPage.set(page);
  }

  protected reset(): void {
    this.searchForm.reset({
      beginDateOperator: 'After', endDateOperator: 'After',
      totalRevenueOperator: 'Equal to', startsWith: false,
    });
    this.searchSubmitted.set(false);
  }
}
