import {Observable} from 'rxjs/Observable'
import 'rxjs/add/observable/of'
import {LogLevel, LogEntry} from './log'
import {environment} from '../../environments/environment'

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
                if (LogLevel.DEBUG > LogLevel[environment.logConsoleLevel]) {
                    console.log("%c %s", this.debugStyle, ...record.buildLogObject())
                }
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
    pendingEntryList: any[] = []

    getAll(): Observable<LogEntry[]> {
        return Observable.of(JSON.parse(localStorage.getItem(this.location)) || [])
    }

    log(record: LogEntry): Observable<boolean> {
        try {

            this.pendingEntryList.push(record)
            if (this.pendingEntryList.length > 1000) {
                this.sync()
            }
        } catch (e) {
            console.error(e)
        }
        return Observable.of(true)
    }

    sync() {
        let logEntryList: LogEntry[]
        logEntryList = JSON.parse(localStorage.getItem(this.location)) || []
        logEntryList = logEntryList.concat(this.pendingEntryList)
        localStorage.setItem(this.location, JSON.stringify(logEntryList))
        this.pendingEntryList = []
    }

    clear(): Observable<boolean> {
        localStorage.removeItem(this.location)
        return Observable.of(true)
    }

}
