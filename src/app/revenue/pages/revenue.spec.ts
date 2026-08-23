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
    expect(fixture.componentInstance['divisions']).toEqual(['Audit and Compliance']);
    expect(fixture.componentInstance['departments']).toEqual(['Access and Eligibility']);
    expect(fixture.componentInstance['rgcStatuses']).toEqual(['Active']);
    expect(fixture.componentInstance['revenueLeads']).toEqual(['Acosta, Elizabeth']);
  });
});
