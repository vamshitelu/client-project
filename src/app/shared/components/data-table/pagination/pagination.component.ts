import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly totalItems = input.required<number>();
  readonly itemsPerPage = input<number>(10);
  readonly currentPage = input<number>(1);
  readonly ariaLabel = input<string>('Pagination');

  readonly pageChange = output<number>();

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.totalItems() / this.itemsPerPage()))
  );

  /**
   * The first page number (1-based) of the active 10-page block.
   * Block 1 → startPage = 1 (pages 1–10)
   * Block 2 → startPage = 11 (pages 11–20), etc.
   */
  readonly startPage = computed(() =>
    Math.floor((this.currentPage() - 1) / 10) * 10 + 1
  );

  /**
   * Up to 10 page numbers (1-based) in the active block, capped at totalPages.
   */
  readonly visiblePages = computed<number[]>(() => {
    const start = this.startPage();
    const total = this.totalPages();
    const end   = Math.min(start + 9, total);
    const pages: number[] = [];
    for (let p = start; p <= end; p++) {
      pages.push(p);
    }
    return pages;
  });

  /** True when a previous 10-page block exists (i.e. not on the first block). */
  readonly hasPreviousPages = computed(() => this.startPage() > 1);

  /** True when a next 10-page block exists beyond the current block. */
  readonly hasMorePages = computed(() => this.startPage() + 10 <= this.totalPages());

  readonly isFirstPage = computed(() => this.currentPage() <= 1);
  readonly isLastPage  = computed(() => this.currentPage() >= this.totalPages());

  goToPage(page: number): void {
    const clamped = Math.max(1, Math.min(page, this.totalPages()));
    if (clamped !== this.currentPage()) {
      this.pageChange.emit(clamped);
    }
  }
}
