import {Routes, RouterModule} from '@angular/router'
import {ViewComponent} from './entity/view.component'
import {TreeViewComponent} from './tree/component'
import {WorkcenterOverviewComponent} from './workcenter/overview.component'
import {WorkcenterDashboardComponent} from './workcenter/dashboard.component'
import {ProjectManagementComponent} from './workcenter/project.management.component'
import {AppsComponent} from './apps/component'

const routes: Routes = [
  //{path: 'genre', component: GenreComponent},
  //{path: 'attribute', component: AttributeComponent},
  //{path: 'entity', component: EntityComponent},
  //{path: 'entity/:identifier', component: EntityCreateComponent},
  {path: 'apps', component: AppsComponent},
  {path: 'view/:id', component: ViewComponent},
  {path: 'tree', component: TreeViewComponent},
  {path: 'workcenter-overview', component: WorkcenterOverviewComponent},
  {path: 'workcenter-dashboard/:id', component: WorkcenterDashboardComponent},
  {path: 'project-management', component: ProjectManagementComponent},
  //{path: 'manufacturing', component: ManufacturingComponent},
  //{path: 'query', component: QueryComponent},
]

export const routingModule = RouterModule.forRoot(routes)


