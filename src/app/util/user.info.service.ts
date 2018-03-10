import {Injectable} from '@angular/core'

@Injectable()
export class UserInfoService {
  userInfo: any
  constructor (){}
  setUserInfo(userInfo: any) {
    this.userInfo = userInfo
  }

  getUserInfo() {
    console.log("get userinfo", this.userInfo)
    return this.userInfo
  }


}
