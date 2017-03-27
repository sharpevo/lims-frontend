import {Routes, RouterModule} from '@angular/router'
import {ViewComponent} from './entity/view.component'

const routes: Routes = [
  //{path: 'genre', component: GenreComponent},
  //{path: 'attribute', component: AttributeComponent},
  //{path: 'entity', component: EntityComponent},
  //{path: 'entity/:identifier', component: EntityCreateComponent},
  {path: 'view/:id', component: ViewComponent},
  //{path: 'manufacturing', component: ManufacturingComponent},
  //{path: 'query', component: QueryComponent},
]

export const routingModule = RouterModule.forRoot(routes)


