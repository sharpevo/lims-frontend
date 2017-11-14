import {Injectable} from '@angular/core'
import {Subject} from 'rxjs/Subject'
import 'rxjs/add/operator/share'
import {UtilService} from './service'
import {SpinnerService} from './spinner.service'
import {MdSnackBar} from '@angular/material'
import {environment} from '../../environments/environment'

@Injectable()
export class UserService {
  private userInfo = new Subject()
  environment = environment
  constructor(
    private spinnerService: SpinnerService,
    private utilService: UtilService,
    public snackBar: MdSnackBar,
  ){
    this.retrieveUserInfo()
  }

  retrieveUserInfo(){
    this.utilService.getUserInfo()
    .subscribe(userInfo =>{
      userInfo['role'] = JSON.parse(userInfo['role'])
      this.userInfo.next(userInfo)
    },
    err => {
      console.log("invalid user")
      this.spinnerService.start()
      this.snackBar.open("Redirect to UIC in 3 seconds...", "OK", {duration: 3000})
      .afterDismissed().subscribe(() => {
        this.spinnerService.stop()
        window.location.href = environment.uicUrl +
          "/login?return_to=" +
          environment.limsUrl.replace(/^https?:\/\//,'')
      });
    },
    () => {
    })
  }

  getUserInfo() {
    return this.userInfo.asObservable()
  }
}
