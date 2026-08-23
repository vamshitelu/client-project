import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ResponseLite } from '../models/RevenueSearchCriteria';
import { RevenueService } from '../services/revenue.service';

@Component({
  selector: 'app-revenue',
  imports: [ReactiveFormsModule],
  templateUrl: './revenue.html',
  styleUrl: './revenue.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Revenue implements OnInit {
  private readonly formBuilder = new FormBuilder().nonNullable;
  private readonly revenueService = inject(RevenueService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  protected readonly searchSubmitted = signal(false);
  protected agencies: readonly string[] = [];
  protected divisions: readonly string[] = [];
  protected departments: readonly string[] = [];
  protected rgcStatuses: readonly string[] = [];
  protected revenueLeads: readonly string[] = [];

  ngOnInit(): void {
    this.revenueService.getDummyResponse().subscribe((response: ResponseLite) => {
      this.assignDropdownOptions(response);
    });
  }

  private assignDropdownOptions(response: ResponseLite): void {
    this.agencies = response.agencyLookupList.map((agency) => agency.agencyName);
    this.divisions = response.divisionLookupList.map((division) => division.divisionName);
    this.departments = response.departmentLookupList.map((department) => department.departmentName);
    this.rgcStatuses = response.rgcStatusLookupList.map((status) => status.rgcStatusName);
    this.revenueLeads = response.revenueLeadLookupList.map((lead) => lead.name);
    this.changeDetector.markForCheck();
  }

  protected readonly searchForm = this.formBuilder.group({
    rgcId: [''], entityName: [''], federalId: [''], agency: [''], division: [''],
    department: [''], rgcStatus: [''], revenueLead: [''], beginDateOperator: ['After'],
    beginDate: [''], endDateOperator: ['After'], endDate: [''],
    totalRevenueOperator: ['Equal to'], amount: [''], startsWith: [false],
  });

  protected search(): void {
    const criteria = this.searchForm.getRawValue();
    console.log('Revenue search request:', criteria);
    this.revenueService.search(criteria);
    this.searchSubmitted.set(true);
  }

  protected reset(): void {
    this.searchForm.reset({
      beginDateOperator: 'After', endDateOperator: 'After',
      totalRevenueOperator: 'Equal to', startsWith: false,
    });
    this.searchSubmitted.set(false);
  }
}
