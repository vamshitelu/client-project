# Data Table Shared Components

## Purpose

This folder contains reusable standalone presentation components for rendering paged, sortable data tables across the application.

The primary shared wrapper is `TableShellHeaderComponent`. It provides a consistent table chrome layer for:

- total record display
- page-size selection
- projected table toolbar content
- projected table headers and rows
- pagination wiring through `PaginationComponent`

It is intended for reusable data-table screens such as Contract Search results, Contract History lists, and document libraries.

## Components in This Package

### `TableShellHeaderComponent`

Primary dumb/presentational wrapper component.

Responsibilities:

- render table shell structure
- render record count and page-size selector
- project toolbar content via content projection
- project header and row markup from parent components
- delegate paging UI to `PaginationComponent`

It does not:

- fetch data
- own sort state
- own list state
- transform API responses
- decide column definitions

### `PaginationComponent`

Small standalone paging control used internally by `TableShellHeaderComponent`.

Responsibilities:

- calculate total pages
- render a Bootstrap 3 pagination control
- emit page changes
- support page-block navigation in 10-page groups

### `TableSortThComponent`

Reusable sortable table-header directive-style standalone component.

Responsibilities:

- render sort caret state
- expose keyboard-accessible sorting behavior
- emit next sort state when activated
- manage `aria-sort` for accessibility

This is applied directly to `<th>` elements.

## API Boundaries

## `TableShellHeaderComponent`

### Inputs

- `totalItems: number`
- `currentPage: number`
- `pageSize: number`
- `pageSizeOptions: readonly number[]`
- `showPagination: boolean` (default: `true`)
- `showPageSizeSelector: boolean` (default: `true`)
- `showRecordCount: boolean` (default: `true`)
- `tableAriaLabel: string` (default: `Data table`)
- `paginationAriaLabel: string` (default: `Table pagination`)
- `tableClasses: string` (default: `table table-striped table-bordered table-hover`)
- `headerTxtAlign: TableTextAlign` (default: `left`)
- `cellTxtAlign: TableTextAlign` (default: `left`)

Default fallback for `pageSizeOptions`:

```typescript
readonly pageSizeOptions = input<readonly number[]>([10, 25, 50, 100]);
```

This preserves backward compatibility for parents that omit the input.

Default fallbacks for additive shell controls:

```typescript
readonly showPagination = input<boolean>(true);
readonly showPageSizeSelector = input<boolean>(true);
readonly showRecordCount = input<boolean>(true);
readonly tableAriaLabel = input<string>('Data table');
readonly paginationAriaLabel = input<string>('Table pagination');
readonly tableClasses = input<string>('table table-striped table-bordered table-hover');
```

These defaults preserve behavior for existing consumers that do not pass the new inputs.

### `TableTextAlign`

Exported from `table-shell-header.component.ts`:

```typescript
export type TableTextAlign = 'left' | 'center' | 'right';
```

Used by `headerTxtAlign` and `cellTxtAlign` inputs. Maps to Bootstrap utility classes applied on `<thead>` and `<tbody>` respectively:

| Value | Bootstrap class applied | Effect |
|-------|------------------------|--------|
| `'left'` | *(none)* | Browser default left alignment |
| `'center'` | `text-center` | Centers all header or body cells |
| `'right'` | `text-right` | Right-aligns all header or body cells |

**Per-column overrides:** When a table has mixed alignment (some columns centered, others not), leave `headerTxtAlign` / `cellTxtAlign` at the default `'left'` and apply Bootstrap text-align utility classes directly on specific `<th>` / `<td>` elements in projected markup. Individual cell classes take precedence via CSS cascade.

**Uniform alignment:** When all headers and all cells share the same alignment (e.g. Adverse Action list), set `headerTxtAlign` and `cellTxtAlign` on the shell and remove the per-element classes.

### Outputs

- `pageSizeChange: number`
- `pageChange: number`

### Content Projection Slots

- `[tableToolbar]`: optional toolbar region above the table
- `[tableHeaders]`: projected header row markup
- `[tableRows]`: projected body rows

### Ownership Boundary

Owned by parent component:

- current dataset
- loading state
- empty-state decisions
- active sort state
- page number state
- page size state
- column selection and field definitions
- response fetching and API interaction

Owned by `TableShellHeaderComponent`:

- shell markup
- shell record count display
- page-size selector rendering
- pagination component integration

## `PaginationComponent`

### Inputs

- `totalItems: number`
- `itemsPerPage: number`
- `currentPage: number`

### Outputs

- `pageChange: number`

## `TableSortThComponent`

### Inputs

- `field: string`
- `activeSort: SortState | null`
- `sortDisabled: boolean` (default: `false`)

### Outputs

- `sortChange: SortState`

### SortState

```typescript
export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}
```

## Reusability Guidelines

Use `TableShellHeaderComponent` when a screen needs:

- a standard Bootstrap 3 table shell
- configurable page-size selection
- pagination under the table
- projected custom columns and rows
- reusable sorting headers through `TableSortThComponent`

Do not use it when a screen needs:

- non-tabular layout
- card/grid display instead of rows/columns
- custom pagination UI unrelated to the shared pattern

## Configurable Options

### Page Size Options

Parents may supply module-specific page-size values.

Examples:

- default fallback: `[10, 25, 50, 100]`
- history-style list: `[10, 20, 30]`
- compact list: `[5, 10, 15, 20]`
- document library: `[25, 50, 100]`

### Sort Columns

Parents define sortable columns by applying `app-table-sort-th` to projected `<th>` elements and handling the `sortChange` output.

To make a specific sortable header render as non-interactive while preserving the same markup shape, pass `sortDisabled` on that `<th>`.

### Toolbar Region

Parents may project buttons, totals, warnings, or filters into the `[tableToolbar]` slot.

## Quick Start Usage

### 1) Import shared components in the standalone parent page

```typescript
import { Component, signal } from '@angular/core';
import { TableShellHeaderComponent, type TableTextAlign } from '@shared/components/data-table/table-shell-header/table-shell-header.component';
import { TableSortThComponent, type SortState } from '@shared/components/data-table/table-sort-th/table-sort-th.component';

@Component({
  selector: 'app-example-list',
  imports: [TableShellHeaderComponent, TableSortThComponent],
  templateUrl: './example-list.page.html',
})
export class ExampleListPage {
  readonly pageNumber = signal(1);
  readonly pageSize = signal(10);
  readonly totalItems = signal(0);
  readonly pageSizeOptions = [5, 10, 15, 20] as const;
  readonly activeSort = signal<SortState>({ field: 'name', direction: 'asc' });

  onPageSizeChange(size: number): void {
    this.pageSize.set(size);
    this.pageNumber.set(1);
  }

  onPageChange(page: number): void {
    this.pageNumber.set(page);
  }

  onSortChange(sort: SortState): void {
    this.activeSort.set(sort);
  }
}
```

### 2) Use the shell in the parent template

```html
<app-table-shell-header
  [totalItems]="totalItems()"
  [currentPage]="pageNumber()"
  [pageSize]="pageSize()"
  [pageSizeOptions]="pageSizeOptions"
  (pageSizeChange)="onPageSizeChange($event)"
  (pageChange)="onPageChange($event)"
>
  <div tableToolbar class="text-right">
    <button class="btn btn-primary" type="button">Example Action</button>
  </div>

  <tr tableHeaders>
    <th
      app-table-sort-th
      field="name"
      [activeSort]="activeSort()"
      (sortChange)="onSortChange($event)"
    >Name</th>
    <th
      app-table-sort-th
      field="status"
      [activeSort]="activeSort()"
      (sortChange)="onSortChange($event)"
    >Status</th>
  </tr>

  @for (row of rows(); track row.id) {
    <tr tableRows>
      <td>{{ row.name }}</td>
      <td>{{ row.status }}</td>
    </tr>
  } @empty {
    <tr tableRows>
      <td colspan="2" class="text-center">No records found.</td>
    </tr>
  }
</app-table-shell-header>
```

## Current Reuse Examples

Current consumers include:

- Contract Search results
- Contract History list
- Contract document upload/library list

## Contributor Notes

- Keep `TableShellHeaderComponent` presentation-only.
- Keep parent-owned state outside this component.
- Preserve Bootstrap 3 table and pagination structure.
- Use Angular 21 signal inputs/outputs and native control flow.
- Keep sorting semantics in `TableSortThComponent`, not in the shell wrapper.
- Keep pagination semantics in `PaginationComponent`, not in each parent template.

## Explicit Ownership Boundary

`TableShellHeaderComponent` owns shell-only concerns:

- shell chrome visibility (`showRecordCount`, `showPageSizeSelector`)
- pagination visibility (`showPagination`)
- shell-level accessibility labels (`tableAriaLabel`, `paginationAriaLabel`)
- shell table classes (`tableClasses`)
- table-wide header alignment (`headerTxtAlign`)
- table-wide body cell alignment (`cellTxtAlign`)

Parent components own feature concerns:

- dataset and row shaping
- loading and error states
- empty-state message content
- active sort state and backend sort request wiring
- which headers are sortable
- per-column alignment overrides when columns have mixed alignment
- row actions and router interactions

`TableSortThComponent` owns column-header interaction concerns:

- keyboard/click sort interaction
- sort direction indicator rendering
- `aria-sort` state exposure
- per-column sort disable (`sortDisabled`)

Avoid moving parent-owned concerns into the shell; this keeps migrations low risk and additive.

## Integration Checklist

### Page Numbering

- `TableShellHeaderComponent` expects `[currentPage]` as **1-based** (page 1 is the first page).
- If your API uses **0-based** pages, convert at the service call site — not in the template binding.

```typescript
// BAD: leaking 0-based offset into the shell binding
[currentPage]="pageNumber()"        // where pageNumber() is 0, 1, 2 …

// GOOD: keep shell always 1-based; convert before calling the API
[currentPage]="pageNumber()"        // where pageNumber() is 1, 2, 3 …
// and in the API call:
const zeroBasedPage = this.pageNumber() - 1;
this.service.getPage(zeroBasedPage, this.pageSize());
```

- When `pageSizeChange` fires, always reset `pageNumber` back to `1` to avoid an out-of-range page.

```typescript
onPageSizeChange(size: number): void {
  this.pageSize.set(size);
  this.pageNumber.set(1);  // ← required
}
```

### Sort State

- Sort state (`SortState`) belongs in the **parent component**, not inside the shell or pagination.
- Initialise `activeSort` with a sensible field/direction default so the first page loads sorted.
- `TableSortThComponent` does not mutate sort state; it emits the next intended state and the parent decides whether to apply it.

```typescript
// In parent component
readonly activeSort = signal<SortState>({ field: 'beginDate', direction: 'asc' });

onSortChange(sort: SortState): void {
  this.activeSort.set(sort);
  this.pageNumber.set(1);  // ← always reset page after a sort change
  this._loadList();
}
```

- Pass the same `activeSort` signal to every `app-table-sort-th` column header; columns that do not match the current field will render without a caret.

### `[totalItems]` Must Reflect Filtered/Server Total

- Always bind `[totalItems]` to the server-reported total, not `list.length`.
- Binding the local array length breaks pagination when pages 2+ exist.

```html
<!-- BAD -->
[totalItems]="list().length"

<!-- GOOD -->
[totalItems]="serverPage()?.totalItems ?? 0"
```

### Content Projection Slot Names

- `[tableToolbar]` must go on a wrapping `<div>`, not directly on a `<tr>` or `<th>`.
- `[tableHeaders]` must be a `<tr>` element — it projects directly into `<thead>`.
- `[tableRows]` must be one or more `<tr>` elements — they project directly into `<tbody>`.

```html
<!-- BAD: projecting a div into tableRows breaks table structure -->
<div tableRows>...</div>

<!-- GOOD -->
<tr tableRows>
  <td>...</td>
</tr>
```

### Empty-State Rows

- Always include an `@empty` block inside your `@for` loop so the table body is never blank.
- The `colspan` must cover all columns including any action/checkbox columns.

```html
@for (row of rows(); track row.id) {
  <tr tableRows>...</tr>
} @empty {
  <tr tableRows>
    <td colspan="5" class="text-center">No records found.</td>
  </tr>
}
```

### `pageSizeOptions` Type

- Define page-size option arrays `as const` to enforce `readonly number[]` compatibility.

```typescript
// BAD: inferred as number[]
readonly pageSizeOptions = [10, 20, 30];

// GOOD: inferred as readonly [10, 20, 30]
readonly pageSizeOptions = [10, 20, 30] as const;
```
