// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `angular-cli.json`.

export const environment = {
  production: false,
  limsUrl: "http://localhost:8000", // for actionUrl of limsbot, return_to fo UIC
  apiUrl: "http://api.lims.igenetech.cn",
  uicUrl: "http://accounts.igenetech.cn",
    limsbotUrl: "http://192.168.1.25:8002/send",
    //limsbotUrl: "http://notif.lims.igenetech.cn/send",
  auditUrl: "http://audit.lims.igenetech.cn",
  version: "dev",
};
