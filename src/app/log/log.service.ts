import {Injectable} from '@angular/core'
import {LogPublisher} from './publisher'
import {LogPublisherService} from './publisher.service'

export enum LogLevel {
    All = 0,
        Debug = 1,
        Info = 2,
        Warn = 3,
        Error = 4,
        Fatal = 5,
        Off = 6
}

export class LogEntry {
    entryDate: Date = new Date()
    message: string = ""
    level: LogLevel = LogLevel.Debug
    extraInfo: any[] = []
    logWithDate: boolean = true

    buildLogString(): string {
        let result = ''
        if (this.logWithDate) {
            result += new Date() + " - "
        }
        result += "Type: " + LogLevel[this.level]
        result += " - Message: " + JSON.stringify(this.message)
        if (this.extraInfo.length) {
            result += " - Extra Info: " + this.formatParams(this.extraInfo)
        }
        return result
    }

    buildLogObject(){
        let ret = []
        let result = ''
        if (this.logWithDate) {
            result += new Date() + " - "
        }
        result += "Type: " + LogLevel[this.level]
        result += " - Message: "
        ret = [result, this.message]
        if (this.extraInfo.length) {
            ret.push(" - Extra Info: ")
            ret.push(this.extraInfo)
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
    level: LogLevel = LogLevel.All
    logWithDate: boolean = true
    publishers: LogPublisher[]

    constructor(private publisherService: LogPublisherService) {
        this.publishers = this.publisherService.publishers
    }

    shouldLog(level: LogLevel): boolean {
        if (this.level !== LogLevel.Off && level >= this.level) {
            return true
        }
        return false
    }

    writeToLog(msg: any, level: LogLevel, ...params: any[]) {
        if (!this.shouldLog(level)){
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

    log(msg: any, ...optionalParams: any[]){
        this.writeToLog(msg, LogLevel.All, optionalParams)
    }

    debug(msg: any, ...optionalParams: any[]){
        this.writeToLog(msg, LogLevel.Debug, optionalParams)
    }

    info(msg: any, ...optionalParams: any[]){
        this.writeToLog(msg, LogLevel.Info, optionalParams)
    }

    warn(msg: any, ...optionalParams: any[]){
        this.writeToLog(msg, LogLevel.Warn, optionalParams)
    }

    error(msg: any, ...optionalParams: any[]){
        this.writeToLog(msg, LogLevel.Error, optionalParams)
    }

    fatal(msg: any, ...optionalParams: any[]){
        this.writeToLog(msg, LogLevel.Fatal, optionalParams)
    }

}

export function LogFunc(target, propertyKey, descriptor){
    const originalMethod = descriptor.value

    descriptor.value = function (...args: any[]) {
        console.log("<<< " + propertyKey)
        const result = originalMethod.apply(this, args)
        console.log(">>> " + propertyKey)
        return result
    }
    return descriptor
}
