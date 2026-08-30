import { Routes } from '@angular/router';
import { Home } from './home/home';
import { Revenue } from './revenue/pages/revenue';
import { RevenueDetails } from './revenue/pages/revenue-details/revenue-details';

export const routes: Routes = [
	{
		path: '',
		component: Home,
		children: [
			{ path: '', component: Revenue },
			{ path: 'revenue/:rgcId', component: RevenueDetails },
		],
	},
];
