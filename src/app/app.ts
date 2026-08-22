import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Revenue } from './revenue/pages/revenue';

@Component({
  selector: 'app-root',
  imports: [Revenue],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
}
