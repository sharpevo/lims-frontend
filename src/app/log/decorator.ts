import {LogService} from './log.service'
import {InjectorContainerModule} from '../injector.module'

export function LogCall(target, propertyKey, descriptor) {
    const originalMethod = descriptor.value
    descriptor.value = function(...args: any[]) {
        // undefined if called outof the function
        const logService = InjectorContainerModule.injector.get(LogService)
        logService.info("Step: " + propertyKey, args)
        const result = originalMethod.apply(this, args)
        return result
    }
    return descriptor
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

