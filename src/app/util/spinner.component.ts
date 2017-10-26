import {Component, NgModule, trigger, transition, style, animate, state} from '@angular/core'
import { SpinnerService} from './spinner.service'
import { Subscription } from 'rxjs/Subscription';

const scheduleMicrotask = Promise.resolve(null);

@Component({
  selector: 'spinner-component',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [   // :enter is alias to 'void => *'
        style({opacity:0}),
        animate(500, style({opacity:1}))
      ]),
      transition(':leave', [   // :leave is alias to '* => void'
        animate(500, style({opacity:0}))
      ])
    ])
  ],
})
export class SpinnerComponent {
  public active: boolean
  subscription: Subscription

  constructor(private spinner: SpinnerService) {
    spinner.status.subscribe((status: boolean) => {
      scheduleMicrotask.then(() => {
        this.active = status
      })
    })
  }
}
