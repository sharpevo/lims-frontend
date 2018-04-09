import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import {LogEntry} from './log.service'

export abstract class LogPublisher {
    location: string
    abstract log(record: LogEntry): Observable<boolean>
    abstract clear(): Observable<boolean>
}

export class LogConsole extends LogPublisher {

    log(record: LogEntry): Observable<boolean> {
        //console.log(record.buildLogString())
        console.log(...record.buildLogObject())
        return Observable.of(true)
    }

    clear(): Observable<boolean> {
        console.clear()
        return Observable.of(true)
    }

}
