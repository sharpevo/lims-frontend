import {Routes, RouterModule, CanActivate, CanLoad} from '@angular/router'
import {ViewComponent} from './entity/view.component'
import {TreeViewComponent} from './tree/component'
import {WorkcenterOverviewComponent} from './workcenter/overview.component'
import {WorkcenterDashboardComponent} from './workcenter/dashboard.component'
import {ProjectManagementComponent} from './workcenter/project.management.component'
import {AppsComponent} from './apps/component'
import {GuardService} from './util/guard.service'
import {RedirectComponent} from './util/redirect.component'
import {MaterialOverviewComponent} from './material/overview.component'
import {SampleOverviewComponent} from './sample/overview.component'
import {KPIComponent} from './statistics/kpi.component'

const routes: Routes = [
  //{path: 'genre', component: GenreComponent},
  //{path: 'attribute', component: AttributeComponent},
  //{path: 'entity', component: EntityComponent},
  //{path: 'entity/:identifier', component: EntityCreateComponent},
  //{path: '', redirectTo: 'apps', pathMatch: 'full' },
  {
    path: 'apps',
    component: AppsComponent,
    canActivate: [GuardService],
  },
  {
    path: 'view/:id',
    component: ViewComponent,
    canActivate: [GuardService],
  },
  {
    path: 'tree',
    component: TreeViewComponent,
    canActivate: [GuardService],
    //data: {
    //expectedRole: 'lims-admin',
    //},
  },
  {
    path: 'workcenter-overview',
    component: WorkcenterOverviewComponent,
    canActivate: [GuardService],
  },
  {
    path: 'workcenter-dashboard/:id',
    component: WorkcenterDashboardComponent,
    canActivate: [GuardService],
    //data: {
    //expectedRole: 'lims-workcenter-',
    //},
  },
  {
    path: 'project-management',
    component: ProjectManagementComponent,
    canActivate: [GuardService],
  },
  {
    path: 'material-overview',
    component: MaterialOverviewComponent,
  },
  //{path: 'manufacturing', component: ManufacturingComponent},
  //{path: 'query', component: QueryComponent},
  {
    path: 'redirect',
    children: [
      {
        path: '**',
        component: RedirectComponent
      }
    ]
  },
  {
    path: 'sample-overview/:sample_code',
    component: SampleOverviewComponent,
    canActivate: [GuardService],
    //data: {
    //expectedRole: 'lims-workcenter-',
    //},
  },
  {
    path: 'statistics/kpi',
    component: KPIComponent,
    //canActivate: [GuardService],
  },
]

export const routingModule = RouterModule.forRoot(routes)


