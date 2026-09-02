import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RevenueGeneratingContract, RevenueTakenInDetail } from '../../models/RevenueSearchCriteria';
import { RevenueService } from '../../services/revenue.service';

interface AttachedDocument {
  documentType: string;
  files: readonly File[];
  fileNames: readonly string[];
}

type UploadedDocument = NonNullable<RevenueGeneratingContract['revenueContractDocumentsUploaded']>[number];

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
  protected readonly revenueTakenInDetails = signal<readonly RevenueTakenInDetail[]>([]);
  protected readonly selectedRevenueDetails = signal<readonly number[]>([]);
  protected readonly attachedDocuments = signal<readonly AttachedDocument[]>([]);
  protected readonly uploadedDocuments = signal<readonly UploadedDocument[]>([]);
  protected readonly stateOptions = signal<readonly string[]>([]);
  protected readonly selectedDocumentType = signal('Contract');
  protected readonly revenueDetailsSubmitted = signal(false);
  protected readonly addressSubmitted = signal(false);
  protected readonly currentFyRevenue = computed(() => this.revenueTakenInDetails().reduce((total, detail) => total + (detail.rgcRevenueTakenIn ?? 0), 0));
  protected readonly allRevenueDetailsSelected = computed(() => {
    const details = this.revenueTakenInDetails();
    const selected = this.selectedRevenueDetails();
    return details.length > 0 && details.every((detail) => selected.includes(detail.rgcRevenueId));
  });
  protected readonly isEditing = signal(false);
  protected readonly contractForm = this.formBuilder.group({
    agency: [''], division: [''], department: [''], entityName: [''], federalId: [''],
    revenueLead: [''], status: [''], beginDate: [''], endDate: [''], expectedRevenue: [''],
    objective: [''], comment: [''],
    address1: ['', Validators.required], address2: [''], city: ['', Validators.required], state: ['', Validators.required], zip: ['', Validators.required],
    phone: [''], phoneExtension: [''], addressComment: [''],
  });

  ngOnInit(): void {
    const rgcId = Number(this.route.snapshot.paramMap.get('rgcId') ?? 100000001);
    this.revenueService.getSearchInitLoad().subscribe((lookups) => {
      this.stateOptions.set(lookups.stateTypeLookupList.map((state) => state.stateName));
    });
    this.revenueService.getRevenueContractDetail(rgcId).subscribe((selectedContract) => {
      this.contract.set(selectedContract);
      if (selectedContract) {
        this.revenueService.getRevenueTakenInDetails(rgcId).subscribe((details) => this.revenueTakenInDetails.set(details));
        this.uploadedDocuments.set(selectedContract.revenueContractDocumentsUploaded ?? []);
        this.patchContractForm(selectedContract);
        this.contractForm.disable();
      }
    });
  }

  protected addRevenueDetail(): void {
    this.revenueTakenInDetails.update((details) => [
      ...details,
      { rgcRevenueId: Date.now(), number: details.length + 1, rgcRevenueTakenIn: null, rgcRevenueDate: null, rgcInvoiceNumber: '', isNew: true },
    ]);
    this.revenueDetailsSubmitted.set(true);
  }

  protected toggleRevenueDetail(rgcRevenueId: number): void {
    this.selectedRevenueDetails.update((selected) => selected.includes(rgcRevenueId)
      ? selected.filter((id) => id !== rgcRevenueId)
      : [...selected, rgcRevenueId]);
  }

  protected toggleAllRevenueDetails(): void {
    this.selectedRevenueDetails.set(this.allRevenueDetailsSelected()
      ? []
      : this.revenueTakenInDetails().map((detail) => detail.rgcRevenueId));
  }

  protected deleteRevenueDetails(): void {
    const selected = this.selectedRevenueDetails();
    this.revenueTakenInDetails.update((details) => details.filter((detail) => !selected.includes(detail.rgcRevenueId)));
    this.selectedRevenueDetails.set([]);
  }

  protected attachDocuments(documentType: string, fileInput: HTMLInputElement): void {
    const files = Array.from(fileInput.files ?? []);
    if (!files.length) return;

    this.attachedDocuments.update((documents) => [...documents, { documentType, files, fileNames: files.map((file) => file.name) }]);
    fileInput.value = '';
  }

  protected downloadAllDocuments(): void {
    this.attachedDocuments()
      .flatMap((document) => document.files)
      .forEach((file) => {
        const downloadUrl = URL.createObjectURL(file);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = file.name;
        link.click();
        URL.revokeObjectURL(downloadUrl);
      });
  }

  protected deleteUploadedDocument(documentIndex: number, fileName: string): void {
    this.uploadedDocuments.update((documents) => documents
      .map((document, index) => {
        if (index !== documentIndex) return document;

        const remainingNames = Object.entries(document.documentNames ?? {})
          .filter(([, name]) => name !== fileName);
        return remainingNames.length ? { ...document, documentNames: Object.fromEntries(remainingNames) } : null;
      })
      .filter((document): document is UploadedDocument => document !== null));
  }

  protected saveRevenueDetails(): void {
    this.revenueDetailsSubmitted.set(true);
    this.addressSubmitted.set(true);
    if (this.contractForm.controls.address1.invalid || this.contractForm.controls.city.invalid
      || this.contractForm.controls.state.invalid || this.contractForm.controls.zip.invalid) return;
    if (this.revenueTakenInDetails().some((detail) => detail.rgcRevenueTakenIn === null || detail.rgcRevenueDate === null)) return;

    this.revenueTakenInDetails.update((details) => details.map((detail) => ({ ...detail, isNew: false })));
    this.contractForm.disable();
    this.isEditing.set(false);
  }

  protected cancelRevenueDetails(): void {
    const rgcId = Number(this.route.snapshot.paramMap.get('rgcId'));
    this.revenueService.getRevenueTakenInDetails(rgcId).subscribe((details) => this.revenueTakenInDetails.set(details));
    this.selectedRevenueDetails.set([]);
    this.revenueDetailsSubmitted.set(false);
    this.addressSubmitted.set(false);
    this.contractForm.disable();
    this.isEditing.set(false);
  }

  protected updateRevenueDetail(detail: RevenueTakenInDetail, field: 'rgcRevenueTakenIn' | 'rgcRevenueDate' | 'rgcInvoiceNumber', value: string): void {
    this.revenueTakenInDetails.update((details) => details.map((item) => item.rgcRevenueId === detail.rgcRevenueId
      ? {
        ...item,
        [field]: field === 'rgcRevenueTakenIn'
          ? Number(value.replace(/[$,]/g, '')) || 0
          : field === 'rgcRevenueDate'
            ? this.parseDateValue(value)
            : value,
      }
      : item));
  }

  protected enableEditing(): void {
    this.isEditing.set(true);
    this.addressSubmitted.set(false);
    this.contractForm.controls.address1.enable();
    this.contractForm.controls.address2.enable();
    this.contractForm.controls.city.enable();
    this.contractForm.controls.state.enable();
    this.contractForm.controls.zip.enable();
    this.contractForm.controls.phone.enable();
    this.contractForm.controls.phoneExtension.enable();
    this.contractForm.controls.addressComment.enable();
  }

  protected formatDateForDisplay(timestamp: string | number | null): string {
    if (timestamp === null || timestamp === '') {
      return '';
    }

    const value = typeof timestamp === 'number' ? timestamp : this.parseDateValue(timestamp);
    if (value === null) {
      return '';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${month}/${day}/${year}`;
  }
  /*
  protected parseDateValue(value: string): number | null {
    if (!value || !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value.trim())) {
      return null;
    }

    const [month, day, year] = value.split('/').map((part) => Number(part));
    const parsedDate = new Date(year, month - 1, day);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate.getTime();
  }*/

  protected parseDateValue(value: string): number | null {
  if (!value) return null;
  const trimmed = value.trim();

  // native <input type="date"> always emits ISO yyyy-mm-dd on selection
  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return this.buildDate(Number(y), Number(m), Number(d));
  }

  // required typed/display format: mm/dd/yyyy
  const usMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
  if (usMatch) {
    const [, m, d, y] = usMatch;
    return this.buildDate(Number(y), Number(m), Number(d));
  }

  return null;
}

private buildDate(year: number, month: number, day: number): number | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;

  const parsedDate = new Date(Date.UTC(year, month - 1, day));
  const isValid = parsedDate.getUTCFullYear() === year
    && parsedDate.getUTCMonth() === month - 1
    && parsedDate.getUTCDate() === day;

  return isValid ? parsedDate.getTime() : null;
}

protected onPickerSelect(event: Event, field: 'beginDate' | 'endDate'): void {
  const iso = (event.target as HTMLInputElement).value; // yyyy-mm-dd
  const parsed = this.parseDateValue(iso);
  this.contractForm.get(field)?.setValue(parsed === null ? '' : this.formatDateForDisplay(parsed));
}

protected onDateInput(event: Event): void {
  const input = event.target as HTMLInputElement;
  console.log('onDateInput called with value:', input.value);
  let digits = input.value.replace(/\D/g, '').slice(0, 8); // strip everything but digits, cap at 8 (mmddyyyy)

  if (digits.length >= 5) {
    input.value = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  } else if (digits.length >= 3) {
    input.value = `${digits.slice(0, 2)}/${digits.slice(2)}`;
  } else {
    input.value = digits;
  }
}

  protected setContractDate(field: 'beginDate' | 'endDate', value: string): void {
    const parsed = this.parseDateValue(value);
    this.contractForm.get(field)?.setValue(parsed === null ? '' : this.formatDateForDisplay(parsed));
  }

  protected cancelEditing(): void {
    const selectedContract = this.contract();
    if (!selectedContract) return;

    this.patchContractForm(selectedContract);
    this.contractForm.disable();
    this.isEditing.set(false);
  }

  protected getLookupLabel(value: unknown, propertyName?: string): string {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      if (propertyName) {
        const target = record[propertyName];
        if (typeof target === 'string') return target;
        if (typeof target === 'number') return String(target);
      }

      const fallback = Object.values(record)
        .filter((entry) => typeof entry === 'string')
        .join(' ');
      return fallback;
    }

    return String(value);
  }

  private patchContractForm(selectedContract: RevenueGeneratingContract): void {
    this.contractForm.patchValue({
      agency: this.getLookupLabel(selectedContract.agency, 'agencyName'),
      division: this.getLookupLabel(selectedContract.division, 'divisionName'),
      department: this.getLookupLabel(selectedContract.department, 'departmentName'),
      entityName: selectedContract.entityName ?? '',
      federalId: selectedContract.federalId ?? '',
      revenueLead: this.getLookupLabel(selectedContract.revenueLead, 'name'),
      status: this.getLookupLabel(selectedContract.status, 'rgcStatusName'),
      beginDate: this.formatDateForDisplay(selectedContract.beginDate),
      endDate: this.formatDateForDisplay(selectedContract.endDate),
      expectedRevenue: selectedContract.expectedRevenue === null ? '' : `$${selectedContract.expectedRevenue.toFixed(2)}`,
      objective: selectedContract.objective ?? '',
      comment: selectedContract.comment ?? '',
      address1: selectedContract.address1 ?? '',
      address2: selectedContract.address2 ?? '',
      city: selectedContract.city ?? '',
      state: this.getLookupLabel(selectedContract.state, 'stateName'),
      zip: selectedContract.zip ?? '',
      phone: selectedContract.phone ?? '',
      phoneExtension: selectedContract.phoneExtension ?? '',
      addressComment: selectedContract.addressComment ?? '',
    });
  }

  protected toDateInputValue(value: string | number | null): string {
    if (value === null || value === '') {
      return '';
    }

    const timestamp = typeof value === 'number' ? value : this.parseDateValue(value);
    if (timestamp === null) {
      return '';
    }

    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }

  protected getDocumentNames(documentNames: Record<string, string> | null): string {
    return this.getDocumentNamesArray(documentNames).join(', ');
  }

  protected getDocumentNamesArray(documentNames: Record<string, string> | null): string[] {
    if (!documentNames) {
      return [];
    }

    return Object.keys(documentNames)
      .map((key) => documentNames[key])
      .filter((name) => !!name);
  }
}
