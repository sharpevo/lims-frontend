import {Injectable} from '@angular/core'
import {LogPublisher, LogConsole} from './publisher'

@Injectable()
export class LogPublisherService {
    publishers: LogPublisher[] = []
    constructor() {
        this.buildPublishers()
    }
    buildPublishers(){
        this.publishers.push(new LogConsole())
    }
}
