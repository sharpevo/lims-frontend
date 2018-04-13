import {Injectable, Injector} from '@angular/core'
import {LogPublisher} from './publisher'
import {LogPublisherService} from './publisher.service'
import {LogLevel, LogEntry} from './log'

@Injectable()
export class LogService {
    level: LogLevel = LogLevel.ALL
    logWithDate: boolean = true
    publishers: LogPublisher[]

    constructor(private publisherService: LogPublisherService) {
        this.publishers = this.publisherService.publishers
    }

    shouldLog(level: LogLevel): boolean {
        if (this.level !== LogLevel.OFF && level >= this.level) {
            return true
        }
        return false
    }

    writeToLog(msg: any, level: LogLevel, params: any) {
        if (!this.shouldLog(level)) {
            return
        }

        let logEntry = new LogEntry()

        logEntry.message = msg
        logEntry.level = level
        logEntry.extraInfo = params
        logEntry.logWithDate = this.logWithDate

        for (let logger of this.publishers) {
            logger.log(logEntry).subscribe()
        }

        //console.log(logEntry.buildLogString())
    }

    log(msg: any, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.ALL, optionalParams)
    }

    clear() {
        for (let logger of this.publishers) {
            logger.clear()
        }
    }

    debug(msg: any, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.DEBUG, optionalParams)
    }

    info(msg: any, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.INFO, optionalParams)
    }

    warn(msg: any, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.WARN, optionalParams)
    }

    error(msg: any, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.ERROR, optionalParams)
    }

    fatal(msg: any, ...optionalParams: any[]) {
        this.writeToLog(msg, LogLevel.FATAL, optionalParams)
    }

}
