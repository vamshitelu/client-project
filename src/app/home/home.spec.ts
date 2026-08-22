import { TestBed } from '@angular/core/testing';
import { Home } from './home';

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [Home] }).compileComponents();
  });

  it('should show revenue by default and switch to expenses', async () => {
    const fixture = TestBed.createComponent(Home);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('#revenue-panel')).toBeTruthy();
    fixture.nativeElement.querySelector('#expenses-tab').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#expenses-panel')).toBeTruthy();
  });
});