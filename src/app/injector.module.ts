import {NgModule, Injector} from '@angular/core'

@NgModule()
export class InjectorContainerModule {
    static injector: Injector;

    constructor(injector: Injector) {
        InjectorContainerModule.injector = injector;
    }
}
