import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import {LogLevel, LogEntry} from './log'

export abstract class LogPublisher {
    location: string
    abstract log(record: LogEntry): Observable<boolean>
    abstract clear(): Observable<boolean>
}

export class LogConsole extends LogPublisher {
    debugStyle = [
        "background-color: #d3d7cf",
        "color: white",
    ].join(";")
    infoStyle = [
        "background-color: #729fcf",
        "color: white",
    ].join(";")
    warnStyle = [
        "background-color: #fcaf3e",
        "color: white",
    ].join(";")
    errorStyle = [
        "background-color: #ef2929",
        "color: white",
    ].join(";")

    log(record: LogEntry): Observable<boolean> {

        switch (record.level) {
            case (LogLevel.DEBUG):
                console.log("%c %s", this.debugStyle, ...record.buildLogObject())
                break
            case (LogLevel.INFO):
                console.log("%c %s", this.infoStyle, ...record.buildLogObject())
                break
            case (LogLevel.WARN):
                console.log("%c %s", this.warnStyle, ...record.buildLogObject())
                break
            case (LogLevel.ERROR):
                console.log("%c %s", this.errorStyle, ...record.buildLogObject())
                break
            default:
                console.log(...record.buildLogObject())
                break
        }
        //console.log(...record.buildLogObject())
        return Observable.of(true)
    }

    clear(): Observable<boolean> {
        console.clear()
        return Observable.of(true)
    }

}

export class LogLocalStorage extends LogPublisher {
    location: string
    constructor() {
        super()
        this.location = "lims-logging"
    }

    getAll(): Observable<LogEntry[]> {
        return Observable.of(JSON.parse(localStorage.getItem(this.location)) || [])
    }

    log(record: LogEntry): Observable<boolean> {
        let logEntryList: LogEntry[]
        try {
            logEntryList = JSON.parse(localStorage.getItem(this.location)) || []
            logEntryList.push(record)
            localStorage.setItem(this.location, JSON.stringify(logEntryList))
        } catch (e) {
            console.error(e)
        }
        return Observable.of(true)

    }

    clear(): Observable<boolean> {
        localStorage.removeItem(this.location)
        return Observable.of(true)
    }

}
