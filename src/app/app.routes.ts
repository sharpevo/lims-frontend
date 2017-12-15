import {Routes, RouterModule, CanActivate, CanLoad} from '@angular/router'
import {ViewComponent} from './entity/view.component'
import {TreeViewComponent} from './tree/component'
import {WorkcenterOverviewComponent} from './workcenter/overview.component'
import {WorkcenterDashboardComponent} from './workcenter/dashboard.component'
import {ProjectManagementComponent} from './workcenter/project.management.component'
import {AppsComponent} from './apps/component'
import {UserService} from './util/user.service'
import {RedirectComponent} from './util/redirect.component'

const routes: Routes = [
  //{path: 'genre', component: GenreComponent},
  //{path: 'attribute', component: AttributeComponent},
  //{path: 'entity', component: EntityComponent},
  //{path: 'entity/:identifier', component: EntityCreateComponent},
  //{path: '', redirectTo: 'apps', pathMatch: 'full' },
  {
    path: 'apps',
    component: AppsComponent,
    canActivate: [UserService],
  },
  {
    path: 'view/:id',
    component: ViewComponent,
    canActivate: [UserService],
  },
  {
    path: 'tree',
    component: TreeViewComponent,
    canActivate: [UserService],
    data: {
      expectedRole: 'lims-admin',
    },
  },
  {
    path: 'workcenter-overview',
    component: WorkcenterOverviewComponent,
    canActivate: [UserService],
  },
  {
    path: 'workcenter-dashboard/:id',
    component: WorkcenterDashboardComponent,
    canActivate: [UserService],
    data: {
      expectedRole: 'lims-workcenter-',
    },
  },
  {
    path: 'project-management',
    component: ProjectManagementComponent,
    canActivate: [UserService],
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
]

export const routingModule = RouterModule.forRoot(routes)


