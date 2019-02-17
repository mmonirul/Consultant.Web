/// <reference types="aurelia-loader-webpack/src/webpack-hot-interface"/>
// we want font-awesome to load as soon as possible to show the fa-spinner
import { Aurelia } from 'aurelia-framework'
import environment from './environment';
import { PLATFORM } from 'aurelia-pal';
import { I18N, Backend, TCustomAttribute } from "aurelia-i18n";
import * as Bluebird from 'bluebird';
import oidcConfig from 'utils/oidc.config.identityserver';
import "font-awesome/css/font-awesome.css";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap";

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
Bluebird.config({ warnings: { wForgottenReturn: false } });

export function configure(aurelia: Aurelia) {
  aurelia.use
      .standardConfiguration()
      .plugin(PLATFORM.moduleName('aurelia-open-id-connect'), () => oidcConfig)
      .developmentLogging()
      .plugin(PLATFORM.moduleName('aurelia-dialog'), config => {
          config.useDefaults();
          config.settings.lock = true;
          config.settings.centerHorizontalOnly = false;
          config.settings.startingZIndex = 5;
          config.settings.keyboard = true;
      })
      .plugin(PLATFORM.moduleName('aurelia-bootstrap-datetimepicker'), (config: any) => {
          config.extra.bootstrapVersion = 4;
          config.extra.iconBase = 'font-awesome';
          config.extra.withDateIcon = true;

          config.options.format = 'YYYY-MM-DD';
          config.options.showTodayButton = true;
          config.extra.buttonClass = "btn btn-outline-secondary";
      })
      .plugin(PLATFORM.moduleName("aurelia-i18n"), (instance) => {
          let aliases = ["t", "i18n"];
          // add aliases for "t" attribute
          TCustomAttribute.configureAliases(aliases);

          // register backend plugin
          instance.i18next.use(Backend.with(aurelia.loader));

          // adapt options to your needs (see http://i18next.com/docs/options/)
          // make sure to return the promise of the setup method, in order to guarantee proper loading
          return instance.setup({
              backend: {
                  // <-- configure backend settings
                  loadPath: "locales/{{lng}}/{{ns}}.json" // <-- XHR settings for where to get the files from
              },
              attributes: aliases,
              lng: "sv-SE",
              fallbackLng: "en-US",
              // Here it is:
              load: "currentOnly",
              debug: false
          });
      })
      .feature(PLATFORM.moduleName('resources/index'));

  // Uncomment the line below to enable animation.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));

  if (environment.debug) {
    aurelia.use.developmentLogging();
  }

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  return aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
