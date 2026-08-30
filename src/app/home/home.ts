import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

type HomeTab = 'revenue' | 'expenses' | 'history';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  protected readonly activeTab = signal<HomeTab>('revenue');

  protected selectTab(tab: HomeTab): void {
    this.activeTab.set(tab);
  }
}