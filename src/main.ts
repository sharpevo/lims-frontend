import './polyfills.ts';

import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './app/app.module';
import { getTranslationProviders } from './app/i18n-providers'

if (environment.production) {
    enableProdMode();
}

getTranslationProviders().then(providers => {
    platformBrowserDynamic().bootstrapModule(AppModule)
})
