# Plan: Column-Config Metadata for `data-table`

## Overview

Add an opt-in column config layer on top of the existing projection-based shell. When a parent provides a `columns` array, the shell owns `<thead>` rendering. When `columns` is omitted, the existing projection-based model (`[tableHeaders]` / `[tableRows]`) continues working untouched. Body rows stay projected in Phase 1. Fully config-driven row rendering (via `TemplateRef`) is deferred to Phase 2.

This builds on the additive shell refactor already completed (Phase 0) and the table-wide alignment inputs (`headerTxtAlign`, `cellTxtAlign`) added as a bridge step.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────┐
│  TableShellHeaderComponent                       │
│  ┌─────────────────────────────────────────┐    │
│  │  Chrome: record count + page-size        │  ← Phase 0 additive inputs
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │  <thead> rendering                       │    │
│  │   • Phase 0: [tableHeaders] projection   │    │
│  │   • Phase 1: @if(isConfigMode) from      │    │
│  │              ColumnDef[] + @else fallback│    │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │  <tbody> rows                            │    │
│  │   • Phase 0–1: [tableRows] projection    │    │
│  │   • Phase 2: config-driven via TemplateRef│   │
│  └─────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────┐    │
│  │  <tfoot> pagination                      │  ← Phase 0 visibility toggle
│  └─────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

---

## Separation of Concerns — Before vs. After

### Before column config

Column labels, sort eligibility, alignment classes, and sort wiring are entangled in every parent template. Changing one column's alignment or disabling sort requires hunting through `<th class="...">` and `<td class="...">` across multiple template files.

### After column config

| Concern | Owner | File |
|---|---|---|
| Column labels, sort eligibility, headerTxtAlign, cellTxtAlign, width | `ColumnDef[]` array | parent component `.ts` |
| Header rendering (sort caret, aria-sort, focus, alignment) | Shell (`@if isConfigMode`) | `table-shell-header.component.html` |
| Data API contract (page, sort field name) | Service + parent | `*.service.ts` + `*.page.ts` |
| Row content (values, actions, pipes) | Parent projected `[tableRows]` | `*.page.html` |
| Data shape | DTO → Model → Mapper | `src/app/shared/dtos / models / mappers` |

`ColumnDef.key` bridges the display contract (header label, per-column alignment) to the API sort field — defined once in the parent component class, no template hunting required.

---

## Phase 1 — ColumnDef model + shell config-mode header

### Step 1 — Create `column-def.model.ts` *(new file)*

File: `src/app/shared/components/data-table/column-def.model.ts`

```typescript
// Reuse the TableTextAlign type already exported from table-shell-header.component.ts
import type { TableTextAlign } from './table-shell-header/table-shell-header.component';

export interface ColumnDef {
  /** Sort field key sent to the API and used for aria-sort tracking. */
  readonly key: string;
  /** Display label rendered in the header cell. */
  readonly label: string;
  /**
   * Whether this column header should be interactive/sortable.
   * Defaults to true. Set to false for display-only columns.
   */
  readonly sortable?: boolean;
  /** Text alignment for the header cell. Defaults to 'left'. */
  readonly headerTxtAlign?: TableTextAlign;
  /** Text alignment for body cells in this column. Informational in Phase 1; enforced in Phase 2. */
  readonly cellTxtAlign?: TableTextAlign;
  /** Optional CSS width string applied to the <th> (e.g. '15%', '120px'). */
  readonly width?: string;
}
```

### Step 2 — Update `table-shell-header.component.ts` *(depends on step 1)*

File: `src/app/shared/components/data-table/table-shell-header/table-shell-header.component.ts`

Add to existing inputs:
```typescript
import type { ColumnDef } from '../column-def.model';
import type { SortState } from '../table-sort-th/table-sort-th.component';

// Optional config-mode inputs (all default to undefined / null)
readonly columns = input<readonly ColumnDef[] | undefined>(undefined);
readonly activeSort = input<SortState | null>(null);

// New output (emits only when shell renders headers in config mode)
readonly sortChange = output<SortState>();

// Computed
readonly isConfigMode = computed(() => (this.columns()?.length ?? 0) > 0);

// Per-column alignment helper
columnHeaderAlignClass(col: ColumnDef): string {
  if (col.headerTxtAlign === 'center') return 'text-center';
  if (col.headerTxtAlign === 'right') return 'text-right';
  return '';
}
```

> **Note:** Do NOT remove or change `headerTxtAlign` and `cellTxtAlign` table-wide inputs. They remain for consumers that need uniform table-wide alignment. `ColumnDef.headerTxtAlign` and `ColumnDef.cellTxtAlign` express per-column alignment in config mode.

### Step 3 — Update `table-shell-header.component.html` *(depends on step 2)*

File: `src/app/shared/components/data-table/table-shell-header/table-shell-header.component.html`

Replace the `<thead>` section:

```html
<thead [class]="headerAlignClass()">
  @if (isConfigMode()) {
    <tr>
      @for (col of columns()!; track col.key) {
        <th
          app-table-sort-th
          [field]="col.key"
          [activeSort]="activeSort()"
          [sortDisabled]="col.sortable === false"
          [class]="columnHeaderAlignClass(col)"
          [style.width]="col.width ?? null"
          (sortChange)="sortChange.emit($event)"
        >{{ col.label }}</th>
      }
    </tr>
  } @else {
    <ng-content select="[tableHeaders]" />
  }
</thead>
```

> `[tableRows]` `<ng-content>` in `<tbody>` stays unchanged. All existing consumers continue to use projection mode via the `@else` branch.

### Step 4 — Add `TableSortThComponent` to shell imports *(depends on step 3)*

File: `src/app/shared/components/data-table/table-shell-header/table-shell-header.component.ts`

```typescript
imports: [FormsModule, PaginationComponent, TableSortThComponent],
```

The shell now directly uses `app-table-sort-th` when rendering in config mode.

### Step 5 — Pilot consumer: Contract Adverse Action *(depends on steps 1–4)*

File: `src/app/features/contract/adverse-action/pages/contract-adverse-action.page.ts`

```typescript
import type { ColumnDef } from '@shared/components/data-table/column-def.model';

// In the component class:
readonly columns: readonly ColumnDef[] = [
  {
    key: 'lastModifiedDate',
    label: 'Last Modified Date',
    sortable: false,
    headerTxtAlign: 'center',
    cellTxtAlign: 'center',
  },
  {
    key: 'adverseActionTrackingNo',
    label: 'Tracking Number',
    sortable: false,
    headerTxtAlign: 'center',
    cellTxtAlign: 'center',
  },
] as const;
```

File: `src/app/features/contract/adverse-action/pages/contract-adverse-action.page.html`

```html
<app-table-shell-header
  [pageSizeOptions]="pageSizeOptions"
  [pageSize]="pageSize()"
  [totalItems]="totalItems()"
  [currentPage]="pageNumber()"
  [columns]="columns"
  tableAriaLabel="Adverse action referral records"
  paginationAriaLabel="Adverse action referral pagination"
  tableClasses="table table-striped table-hover"
  (pageSizeChange)="onPageSizeChange($event)"
  (pageChange)="onPageChange($event)"
>
  <!-- No [tableHeaders] projection — headers are rendered from columns config -->

  @for (row of sortedSummaryList(); track row.adverseActionId) {
    <tr tableRows>
      <td>{{ row.lastModifiedDate | date: 'MM/dd/yyyy' }}</td>
      <td class="wordwrap">
        <button
          type="button"
          class="btn btn-link"
          (click)="openRecord(row.adverseActionId)"
          [attr.aria-label]="'Open adverse action ' + (row.adverseActionTrackingNo || row.adverseActionId)"
        >
          {{ row.adverseActionTrackingNo || row.adverseActionId }}
        </button>
      </td>
    </tr>
  } @empty {
    <tr tableRows>
      <td [attr.colspan]="columns.length" class="error-wrapper text-center">
        <strong>No records found.</strong>
      </td>
    </tr>
  }
</app-table-shell-header>
```

> Body cell alignment (`text-center`) is not yet auto-applied from `ColumnDef.cellTxtAlign` in Phase 1. The parent still adds alignment classes manually to `<td>` elements, or relies on the table-wide `cellTxtAlign` shell input as a fallback. Full auto-application is deferred to Phase 2.

### Step 6 — Update `data-table.README.md` *(depends on steps 1–4)*

- Document `ColumnDef` interface.
- Add config-mode vs projection-mode comparison table.
- Add Quick Start usage example for config mode.
- Document that `cellTxtAlign` in `ColumnDef` is informational in Phase 1.

---

## Phase 2 — Config-driven row template *(deferred, not in current scope)*

### Objective

Remove all column/alignment markup from parent row templates. The shell renders `<tr>` + `<td>` automatically from `ColumnDef` metadata and a row template reference.

### Proposed API extension

```typescript
// New inputs on TableShellHeaderComponent
readonly rows = input<readonly unknown[]>([]);
readonly rowTemplate = input<TemplateRef<{ $implicit: unknown; columns: readonly ColumnDef[] }> | null>(null);
```

### Behavior

When `rowTemplate` is provided alongside `columns`:
- Shell renders `<tr>` for each item in `rows`
- Each `<td>` automatically receives the `cellTxtAlign` class from the matching `ColumnDef`
- Parent projects only the cell content template

### Constraint

Angular signal inputs do not support generic type parameters at the component level. Recommended approach: type `rows` as `readonly unknown[]` and cast with `$any()` at the template boundary, or document the typing contract in the component's README.

### Second consumer pilot

Contract Search is the best next candidate after Adverse Action:
- 9 columns, all sortable
- Mixed alignment (2 of 9 columns are centered)
- Using config mode removes 9 `app-table-sort-th` attribute blocks from the template
- Pilot should confirm that per-column `headerTxtAlign` overrides the table-wide `headerTxtAlign` input correctly

---

## Relevant Files

### New
- `src/app/shared/components/data-table/column-def.model.ts` — `ColumnDef` interface

### Modified (shared)
- `src/app/shared/components/data-table/table-shell-header/table-shell-header.component.ts` — `columns`, `activeSort`, `sortChange`, `isConfigMode`, `columnHeaderAlignClass`
- `src/app/shared/components/data-table/table-shell-header/table-shell-header.component.html` — `@if (isConfigMode())` header branch + `@else` projection fallback
- `src/app/shared/components/data-table/data-table.README.md`

### Modified (pilot)
- `src/app/features/contract/adverse-action/pages/contract-adverse-action.page.ts`
- `src/app/features/contract/adverse-action/pages/contract-adverse-action.page.html`

### Unchanged (regression safety)
- `src/app/shared/components/data-table/table-sort-th/table-sort-th.component.ts` — no change needed
- `src/app/shared/components/data-table/pagination/pagination.component.ts` — no change needed
- All other existing consumers — zero changes; they remain in projection mode via the `@else` fallback

---

## Verification

1. `get_errors` on all modified shared files after step 4.
2. `get_errors` on adverse-action files after step 5.
3. Confirm all existing consumers compile untouched (projection-mode `@else` branch).
4. Smoke check adverse-action list view: headers render from `ColumnDef`, centered, no sort carets, pagination works.
5. Smoke check contract-search (untouched): sort carets still present, column-level alignment still applied from projected markup.

---

## Decisions

- `ColumnDef` lives inside `data-table/` — it is a structural display contract for the table component, not a business data model.
- `TextAlign` type (already exported as `TableTextAlign` from `table-shell-header.component.ts`) is reused in `ColumnDef` — no duplication.
- `cellTxtAlign` is in `ColumnDef` from the start so consumers can define it early, even though the shell does not auto-apply it to `<td>` until Phase 2.
- The projection escape hatch (`[tableHeaders]` / `[tableRows]`) is **never removed** — tables with complex per-cell markup (router-link, nested components, conditional badges) always have a clean fallback.
- `activeSort` and `sortChange` on the shell are needed only in config mode. In projection mode, the parent wires these directly to `app-table-sort-th` in projected markup.
