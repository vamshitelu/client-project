import { TestBed } from '@angular/core/testing';
import { Revenue } from './revenue';

describe('Revenue', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Revenue] }).compileComponents();
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
});
