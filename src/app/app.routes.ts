import { Routes } from '@angular/router';
import { Home } from './home/home';
import { RevenueDetails } from './revenue/pages/revenue-details/revenue-details';

export const routes: Routes = [
	{ path: 'revenue/:rgcId', component: RevenueDetails },
	{ path: '', component: Home },
];
