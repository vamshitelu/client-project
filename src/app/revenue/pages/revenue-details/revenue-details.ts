import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RevenueGeneratingContract } from '../../models/RevenueSearchCriteria';
import { RevenueService } from '../../services/revenue.service';

@Component({
  selector: 'app-revenue-details',
  imports: [DatePipe, ReactiveFormsModule, RouterLink],
  templateUrl: './revenue-details.html',
  styleUrl: './revenue-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevenueDetails implements OnInit {
  private readonly formBuilder = new FormBuilder().nonNullable;
  private readonly route = inject(ActivatedRoute);
  private readonly revenueService = inject(RevenueService);
  protected readonly contract = signal<RevenueGeneratingContract | null>(null);
  protected readonly isEditing = signal(false);
  protected readonly contractForm = this.formBuilder.group({
    agency: [''], division: [''], department: [''], entityName: [''], federalId: [''],
    revenueLead: [''], status: [''], beginDate: [''], endDate: [''], expectedRevenue: [''],
    objective: [''], comment: [''],
  });

  ngOnInit(): void {
    const rgcId = Number(this.route.snapshot.paramMap.get('rgcId'));
    this.revenueService.getRevenueGeneratingContracts().subscribe((response) => {
      const selectedContract = response._embedded.revenueGeneratingContractList.find((item) => item.rgcId === rgcId) ?? null;
      this.contract.set(selectedContract);
      if (selectedContract) {
        this.patchContractForm(selectedContract);
        this.contractForm.disable();
      }
    });
  }

  protected enableEditing(): void {
    this.isEditing.set(true);
    this.contractForm.disable();
  }

  protected cancelEditing(): void {
    const selectedContract = this.contract();
    if (!selectedContract) return;

    this.patchContractForm(selectedContract);
    this.contractForm.disable();
    this.isEditing.set(false);
  }

  private patchContractForm(selectedContract: RevenueGeneratingContract): void {
    this.contractForm.patchValue({
      ...selectedContract,
      federalId: '',
      beginDate: this.toDateInputValue(selectedContract.beginDate),
      endDate: this.toDateInputValue(selectedContract.endDate),
      expectedRevenue: selectedContract.expectedRevenue === null ? '' : `$${selectedContract.expectedRevenue.toFixed(2)}`,
    });
  }

  private toDateInputValue(timestamp: number | null): string {
    return timestamp ? new Date(timestamp).toISOString().slice(0, 10) : '';
  }
}
