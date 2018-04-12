
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
        result += " | "
        result += JSON.stringify(this.message)
        if (this.extraInfo.length) {
            result += " < " + this.formatParams(this.extraInfo)
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
        result += " | "
        ret = [result, this.message]
        if (this.extraInfo.length) {
            ret.push("<")
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

export enum LogLevel {
    ALL = 0,
    DEBUG = 1,
    INFO = 2,
    WARN = 3,
    ERROR = 4,
    FATAL = 5,
    OFF = 6
}

