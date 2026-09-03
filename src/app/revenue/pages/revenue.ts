import { ChangeDetectionStrategy, ChangeDetectorRef, Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TableShellHeaderComponent } from '../../shared/components/data-table/table-shell-header/table-shell-header.component';
import { SortState, TableSortThComponent } from '../../shared/components/data-table/table-sort-th/table-sort-th.component';
import {
  AgencyLookup,
  DepartmentLookup,
  DivisionLookup,
  SearchInitLoadResponse,
  RevenueLeadLookup,
  RevenueGeneratingContractListItem,
} from '../models/RevenueSearchCriteria';
import { RevenueService } from '../services/revenue.service';

@Component({
  selector: 'app-revenue',
  imports: [ReactiveFormsModule, DatePipe, RouterLink, TableShellHeaderComponent, TableSortThComponent],
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
  private divisionLookups: readonly DivisionLookup[] = [];
  protected departments: readonly string[] = [];
  private departmentLookups: readonly DepartmentLookup[] = [];
  protected rgcStatuses: readonly string[] = [];
  protected revenueLeads: readonly string[] = [];
  private revenueLeadLookups: readonly RevenueLeadLookup[] = [];
  protected readonly searchResults = signal<readonly RevenueGeneratingContractListItem[]>([]);
  protected readonly activeSort = signal<SortState>({ field: 'rgcNumber', direction: 'asc' });
  protected readonly sortedSearchResults = computed(() => {
    const { field, direction } = this.activeSort();
    const multiplier = direction === 'asc' ? 1 : -1;
    return [...this.searchResults()].sort((left, right) =>
      String(left[field as keyof RevenueGeneratingContractListItem] ?? '').localeCompare(
        String(right[field as keyof RevenueGeneratingContractListItem] ?? ''),
        undefined,
        { numeric: true, sensitivity: 'base' },
      ) * multiplier
    );
  });
  protected readonly pagedSearchResults = computed(() => {
    return this.sortedSearchResults();
  });
  protected readonly totalResults = signal(0);
  protected readonly pageSize = signal(10);
  protected readonly currentPage = signal(1);

  ngOnInit(): void {
    this.revenueService.getSearchInitLoad().subscribe((response: SearchInitLoadResponse) => {
      this.assignDropdownOptions(response);
    });
  }

  private assignDropdownOptions(response: SearchInitLoadResponse): void {
    this.agencies = response.agencyLookupList;
    this.divisionLookups = response.divisionLookupList;
    this.departmentLookups = response.departmentLookupList;
    this.revenueLeadLookups = response.revenueLeadLookupList;
    this.rgcStatuses = response.rgcStatusLookupList.map((status) => status.rgcStatusName);
    this.changeDetector.markForCheck();
  }

  protected readonly searchForm = this.formBuilder.group({
    rgcId: [''], entityName: [''], federalId: [''], agency: [''], agencyId: [''], division: [''],
    department: [''], rgcStatus: [''], revenueLead: [''], beginDateOperator: ['After'],
    beginDate: [''], endDateOperator: ['After'], endDate: [''],
    totalRevenueOperator: ['Equal to'], amount: [''], startsWith: [false],
  });
  private activeCriteria: ReturnType<typeof this.searchForm.getRawValue> | null = null;

  protected agencyChanged(agencyName: string): void {
    const selectedAgency = this.agencies.find((agency) => agency.agencyName === agencyName);
    const agencyId = selectedAgency?.agencyId ?? '';
    this.searchForm.controls.agencyId.setValue(agencyId);
    this.divisions = this.divisionLookups
      .filter((division) => division.agencyId === agencyId && division.divisionName)
      .map((division) => division.divisionName);
    this.revenueLeads = this.revenueLeadLookups
      .filter((lead) => lead.agencyName === agencyName && lead.name)
      .map((lead) => lead.name);
    this.departments = [];
    this.searchForm.patchValue({
      division: '',
      department: '',
      rgcStatus: '',
      revenueLead: '',
      beginDateOperator: 'After',
      endDateOperator: 'After',
      totalRevenueOperator: 'Equal to',
    });
  }

  protected divisionChanged(divisionName: string): void {
    const agencyId = this.searchForm.controls.agencyId.value;
    const selectedDivision = this.divisionLookups.find(
      (division) => division.agencyId === agencyId && division.divisionName === divisionName,
    );
    this.departments = this.departmentLookups
      .filter((department) => department.divisionId === selectedDivision?.divisionId && department.departmentName)
      .map((department) => department.departmentName);
    this.searchForm.controls.department.reset('');
  }

  protected sortChanged(sort: SortState): void {
    this.activeSort.set(sort);
  }

  protected search(): void {
    const criteria = this.searchForm.getRawValue();
    console.log('Revenue search request:', criteria);
    this.revenueService.search(criteria);
    this.activeCriteria = criteria;
    this.loadPage(1);
    this.searchSubmitted.set(true);
  }

  private loadPage(page: number): void {
    if (!this.activeCriteria) {
      return;
    }

    this.revenueService.getRevenueGeneratingContracts(this.activeCriteria, page - 1, this.pageSize()).subscribe((response) => {
      const contracts = response._embedded.revenueGeneratingContractList;
      this.searchResults.set(contracts);
      this.totalResults.set(response.page.totalElements);
      this.currentPage.set(page);
    });
  }

  protected pageSizeChanged(size: number): void {
    this.pageSize.set(size);
    this.loadPage(1);
  }

  protected pageChanged(page: number): void {
    this.loadPage(page);
  }

  protected reset(): void {
    this.searchForm.reset({
      beginDateOperator: 'After', endDateOperator: 'After',
      totalRevenueOperator: 'Equal to', startsWith: false,
    });
    this.activeCriteria = null;
    this.searchSubmitted.set(false);
  }
}
