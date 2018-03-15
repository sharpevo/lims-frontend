import {Injectable} from '@angular/core'
import {Subject} from 'rxjs/Subject'
import 'rxjs/add/operator/share'

@Injectable()
export class SpinnerService {
  public status: Subject<boolean> = new Subject()
  private _active: boolean = false
  private _count: number = 0

  public get active(): boolean {
    return this._active
  }

  public set active(v: boolean) {
    this._active = v
    this.status.next(v)
  }

  public start() {
    if (this._count == 0){
      this.active = true
    }
    this._count += 1
  }

  public stop() {
    this._count -= 1
    if (this._count == 0) {
      this.active = false
    }
  }
}
