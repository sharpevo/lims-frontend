// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  limsUrl: "http://192.168.1.25:8000", // for actionUrl of limsbot
  apiUrl: "http://192.168.1.25:3000",
  limsbotUrl: "http://192.168.1.25:8002/send",
  version: "dev",
};
