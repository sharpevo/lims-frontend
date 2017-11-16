import {Injectable} from '@angular/core'
import {Subject} from 'rxjs/Subject'
import 'rxjs/add/operator/share'
import {UtilService} from './service'
import {EntityService} from '../entity/service'
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
    private entityService: EntityService,
    public snackBar: MdSnackBar,
  ){}


      })
      })
  }

  }
}
