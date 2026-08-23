import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

@Component({
  selector: '[app-table-sort-th]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'btn-primary',
    role: 'columnheader',
    '[attr.aria-sort]': 'ariaSortValue()',
    '[style.cursor]': "sortDisabled() ? 'default' : 'pointer'",
    '(click)': 'onSort()',
    '(keydown.enter)': 'onSort()',
    '(keydown.space)': '$event.preventDefault(); onSort()',
    '[attr.tabindex]': "sortDisabled() ? '-1' : '0'",
  },
  //TODO: https://github.com/TXHHS-ADMIN/scor-ui/pull/32/changes/BASE..b735eaac11766e47994edecb82ea2fbc6be47795#diff-a2be7cccc568f7d9bdb3f35708d4d94a8c81c0d86e42dfe700dcba6b232ea706
  template: `
    @if (isActiveAsc()) {
      <span class="fa fa-caret-up" aria-hidden="true">&nbsp;</span>
    } @else if (isActiveDesc()) {
      <span class="fa fa-caret-down" aria-hidden="true">&nbsp;</span>
    }
    <ng-content />
  `,
})
export class TableSortThComponent {
  readonly field = input.required<string>();
  readonly activeSort = input<SortState | null>(null);
  readonly sortDisabled = input<boolean>(false);

  readonly sortChange = output<SortState>();

  readonly isActiveAsc = computed(
    () =>
      !this.sortDisabled() &&
      this.activeSort()?.field === this.field() &&
      this.activeSort()?.direction === 'asc'
  );

  readonly isActiveDesc = computed(
    () =>
      !this.sortDisabled() &&
      this.activeSort()?.field === this.field() &&
      this.activeSort()?.direction === 'desc'
  );

  readonly ariaSortValue = computed<'ascending' | 'descending' | 'none'>(() => {
    if (this.isActiveAsc()) return 'ascending';
    if (this.isActiveDesc()) return 'descending';
    return 'none';
  });

  onSort(): void {
    if (this.sortDisabled()) {
      return;
    }
    const current = this.activeSort();
    const isSameField = current?.field === this.field();
    const direction: 'asc' | 'desc' =
      isSameField && current?.direction === 'asc' ? 'desc' : 'asc';
    this.sortChange.emit({ field: this.field(), direction });
  }
}
