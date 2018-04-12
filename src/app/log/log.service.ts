import {Injectable} from '@angular/core'
import {LogPublisher} from './publisher'
import {LogPublisherService} from './publisher.service'
import {LogLevel} from './log'

export class LogEntry {
    entryDate: Date = new Date()
    message: string = ""
    level: LogLevel = LogLevel.DEBUG
    extraInfo: any[] = []
    logWithDate: boolean = true

    getTimeStamp() {
        let date = new Date()
        return date.getHours() + ':' +
            date.getMinutes() + ':' +
            date.getSeconds() + '.' +
            date.getMilliseconds()
    }

    buildLogString(): string {
        let result = ''
        result += "[" + LogLevel[this.level] + "] "
        if (this.logWithDate) {
            result += this.getTimeStamp()
        }
        result += " :: "
        result += JSON.stringify(this.message)
        if (this.extraInfo.length) {
            result += " :: " + this.formatParams(this.extraInfo)
        }
        return result
    }

    buildLogObject() {
        let ret = []
        let result = ''
        result += "[" + LogLevel[this.level] + "] "
        if (this.logWithDate) {
            result += this.getTimeStamp()
        }
        result += " ::"
        ret = [result, this.message]
        if (this.extraInfo.length) {
            ret.push(":: ")
            this.extraInfo.forEach(info => {
                ret.push(info)
            })
        }
        return ret
    }

    formatParams(params: any[]): string {
        if (params.some(p => typeof p == "object")) {
            let result = ""
            for (let item of params) {
                result += JSON.stringify(item) + ","
            }
            return result
        }
        return params.join(",")
    }
}

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

export function LogFunc(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value

    descriptor.value = function(...args: any[]) {
        console.log("<<< " + propertyKey)
        const result = originalMethod.apply(this, args)
        console.log(">>> " + propertyKey)
        return result
    }
    return descriptor
}
