import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PaginationComponent } from '../pagination/pagination.component';

/** Text alignment values accepted by headerTxtAlign and cellTxtAlign inputs. */
export type TableTextAlign = 'left' | 'center' | 'right';

@Component({
  selector: 'app-table-shell-header',
  templateUrl: './table-shell-header.component.html',
  styleUrl: './table-shell-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PaginationComponent],
})
export class TableShellHeaderComponent {
  readonly totalItems = input.required<number>();
  readonly currentPage = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly pageSizeOptions = input<readonly number[]>([10, 25, 50, 100]);
  readonly showPagination = input<boolean>(true);
  readonly showPageSizeSelector = input<boolean>(true);
  readonly showRecordCount = input<boolean>(true);
  readonly tableAriaLabel = input<string>('Data table');
  readonly paginationAriaLabel = input<string>('Table pagination');
  readonly tableClasses = input<string>('table table-striped table-hover');
  /** Text alignment applied to all header cells via the <thead> element. Default: 'left'. */
  readonly headerTxtAlign = input<TableTextAlign>('left');
  /** Text alignment applied to all body cells via the <tbody> element. Default: 'left'. */
  readonly cellTxtAlign = input<TableTextAlign>('left');

  readonly pageSizeChange = output<number>();
  readonly pageChange = output<number>();

  readonly hasMetadataChrome = computed(
    () => this.showRecordCount() || this.showPageSizeSelector()
  );

  /** Bootstrap text-align class for the <thead> element (empty string for left/default). */
  readonly headerAlignClass = computed(() => {
    const align = this.headerTxtAlign();
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return '';
  });

  /** Bootstrap text-align class for the <tbody> element (empty string for left/default). */
  readonly cellAlignClass = computed(() => {
    const align = this.cellTxtAlign();
    if (align === 'center') return 'text-center';
    if (align === 'right') return 'text-right';
    return '';
  });

  /** First record index shown on the current page (1-based, 0 when empty). */
  readonly startRecord = computed(() => {
    if (this.totalItems() === 0) return 0;
    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  /** Last record index shown on the current page. */
  readonly endRecord = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.totalItems())
  );

  onPageSizeChange(size: number): void {
    this.pageSizeChange.emit(size);
  }

  onPageChange(page: number): void {
    this.pageChange.emit(page);
  }
}
