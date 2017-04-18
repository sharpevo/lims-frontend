import {Routes, RouterModule} from '@angular/router'
import {ViewComponent} from './entity/view.component'
import {TreeViewComponent} from './tree/component'
import {WorkcenterOverviewComponent} from './workcenter/overview.component'

const routes: Routes = [
  //{path: 'genre', component: GenreComponent},
  //{path: 'attribute', component: AttributeComponent},
  //{path: 'entity', component: EntityComponent},
  //{path: 'entity/:identifier', component: EntityCreateComponent},
  {path: 'view/:id', component: ViewComponent},
  {path: 'tree', component: TreeViewComponent},
  {path: 'workcenter-overview', component: WorkcenterOverviewComponent},
  //{path: 'manufacturing', component: ManufacturingComponent},
  //{path: 'query', component: QueryComponent},
]

export const routingModule = RouterModule.forRoot(routes)


