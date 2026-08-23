import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Revenue } from './revenue';

describe('Revenue', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Revenue],
      providers: [provideHttpClient(), provideHttpClientTesting()],
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
    const httpTesting = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    httpTesting.expectOne('assets/data/response-lite.json').flush({
      agencyLookupList: [{ agencyName: 'Agency A' }],
      divisionLookupList: [{ divisionName: 'Division A' }],
      departmentLookupList: [{ departmentName: 'Department A' }],
      rgcStatusLookupList: [{ rgcStatusName: 'Active' }],
      revenueLeadLookupList: [{ name: 'Lead A' }],
    });

    expect(fixture.componentInstance['agencies']).toEqual(['Agency A']);
    expect(fixture.componentInstance['divisions']).toEqual(['Division A']);
    expect(fixture.componentInstance['departments']).toEqual(['Department A']);
    expect(fixture.componentInstance['rgcStatuses']).toEqual(['Active']);
    expect(fixture.componentInstance['revenueLeads']).toEqual(['Lead A']);
  });
});
