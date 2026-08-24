import { TestBed } from '@angular/core/testing';
import { Revenue } from './revenue';

describe('Revenue', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Revenue],
    }).compileComponents();
  });

  it('should create the revenue search component', () => {
    const fixture = TestBed.createComponent(Revenue);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should show a status after searching', async () => {
    const fixture = TestBed.createComponent(Revenue);
    fixture.componentInstance['search']();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('[role="status"]')?.textContent).toContain('Search submitted.');
  });

  it('should assign dummy response values to the dropdowns', () => {
    const fixture = TestBed.createComponent(Revenue);
    fixture.detectChanges();

    expect(fixture.componentInstance['agencies'][0].agencyName).toBe('DFPS');
    fixture.componentInstance['searchForm'].controls.agency.setValue('DFPS');
    fixture.componentInstance['agencyChanged']('DFPS');
    expect(fixture.componentInstance['searchForm'].getRawValue().agencyId).toBe('2');
    expect(fixture.componentInstance['divisions']).toContain('Child Care Licensing');
    expect(fixture.componentInstance['divisions']).not.toContain('Audit and Compliance');
    expect(fixture.componentInstance['revenueLeads']).toContain('Revenue1, Dfpsuser');
    expect(fixture.componentInstance['revenueLeads']).not.toContain('Acosta, Elizabeth');
    expect(fixture.componentInstance['departments']).toEqual([]);

    fixture.componentInstance['searchForm'].controls.division.setValue('Child Care Licensing');
    fixture.componentInstance['divisionChanged']('Child Care Licensing');
    expect(fixture.componentInstance['departments']).toEqual(['Child Care Licensing']);

    fixture.componentInstance['searchForm'].controls.agency.setValue('HHSC');
    fixture.componentInstance['searchForm'].patchValue({
      division: 'Audit and Compliance',
      department: 'Audit',
      rgcStatus: 'Active',
      revenueLead: 'Revenue1, Dfpsuser',
    });
    fixture.componentInstance['agencyChanged']('HHSC');
    expect(fixture.componentInstance['searchForm'].getRawValue().agencyId).toBe('1');
    expect(fixture.componentInstance['divisions']).toContain('Audit and Compliance');
    expect(fixture.componentInstance['divisions']).not.toContain('Child Care Licensing');
    expect(fixture.componentInstance['departments']).toEqual([]);
    expect(fixture.componentInstance['revenueLeads']).toContain('Acosta, Elizabeth');
    expect(fixture.componentInstance['revenueLeads']).not.toContain('Revenue1, Dfpsuser');
    expect(fixture.componentInstance['searchForm'].getRawValue()).toMatchObject({
      division: '',
      department: '',
      rgcStatus: '',
      revenueLead: '',
      beginDateOperator: 'After',
      endDateOperator: 'After',
      totalRevenueOperator: 'Equal to',
    });
    expect(fixture.componentInstance['searchForm'].getRawValue().division).toBe('');
    expect(fixture.componentInstance['rgcStatuses']).toEqual(['Active', 'Approved', 'Expired']);
    expect(fixture.componentInstance['revenueLeads']).toContain('Acosta, Elizabeth');
  });
});
