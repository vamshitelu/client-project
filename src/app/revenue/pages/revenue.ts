import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RevenueService } from '../services/revenue.service';

@Component({
  selector: 'app-revenue',
  imports: [ReactiveFormsModule],
  templateUrl: './revenue.html',
  styleUrl: './revenue.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Revenue {
  private readonly formBuilder = new FormBuilder().nonNullable;
  private readonly revenueService = inject(RevenueService);
  protected readonly searchSubmitted = signal(false);
  protected readonly agencies = this.revenueService.retrieveAgencies();
  protected readonly divisions = this.revenueService.retrieveDivisions();
  protected readonly departments = this.revenueService.retrieveDepartments();
  protected readonly rgcStatuses = this.revenueService.retrieveRgcStatuses();
  protected readonly revenueLeads = this.revenueService.retrieveRevenueLeads();

  protected readonly searchForm = this.formBuilder.group({
    rgcId: [''], entityName: [''], federalId: [''], agency: [''], division: [''],
    department: [''], rgcStatus: [''], revenueLead: [''], beginDateOperator: ['After'],
    beginDate: [''], endDateOperator: ['After'], endDate: [''],
    totalRevenueOperator: ['Equal to'], amount: [''], startsWith: [false],
  });

  protected search(): void {
    this.revenueService.search(this.searchForm.getRawValue());
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
