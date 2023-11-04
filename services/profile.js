"use strict";

// Imports dependencies
const GraphApi = require("./graph-api"),
  i18n = require("../i18n.config"),
  config = require("./config"),
  locales = i18n.getLocales();

module.exports = class Profile {
  setWebhook() {
    GraphApi.callSubscriptionsAPI();
    GraphApi.callSubscribedApps();
  }

  setPageFeedWebhook() {
    GraphApi.callSubscriptionsAPI("feed");
    GraphApi.callSubscribedApps("feed");
  }

  setThread() {
    let profilePayload = {
      ...this.getGetStarted(),
      ...this.getGreeting(),
      ...this.getPersistentMenu()
    };

    GraphApi.callMessengerProfileAPI(profilePayload);
  }

  async setPersonas() {
    let newPersonas = config.newPersonas;

    let personas = await GraphApi.getPersonaAPI();
    for (let persona of personas) {
      config.pushPersona({
        name: persona.name,
        id: persona.id
      });
    }
    let existingPersonas = config.personas;
    console.log({ existingPersonas });

    for (let persona of newPersonas) {
      if (!(persona.name in existingPersonas)) {
        let personaId = await GraphApi.postPersonaAPI(
          persona.name,
          persona.picture
        );
        config.pushPersona({
          name: persona.name,
          id: personaId
        });
        console.log(config.personas);
      }
    }
  }

  setGetStarted() {
    let getStartedPayload = this.getGetStarted();
    GraphApi.callMessengerProfileAPI(getStartedPayload);
  }

  setGreeting() {
    let greetingPayload = this.getGreeting();
    GraphApi.callMessengerProfileAPI(greetingPayload);
  }

  setPersistentMenu() {
    let menuPayload = this.getPersistentMenu();
    GraphApi.callMessengerProfileAPI(menuPayload);
  }

  setWhitelistedDomains() {
    let domainPayload = this.getWhitelistedDomains();
    GraphApi.callMessengerProfileAPI(domainPayload);
  }

  getGetStarted() {
    return {
      get_started: {
        payload: "GET_STARTED"
      }
    };
  }

  // getGreeting() {
  //   let greetings = [];

  //   for (let locale of locales) {
  //     greetings.push(this.getGreetingText(locale));
  //   }

  //   return {
  //     greeting: greetings
  //   };
  // }

  getGreeting() {
    let greetings = [];

    for (let locale of locales) {
      // if (locale === "en_US") {
      //   // Set the 'default' locale
      //   greetings.push({
      //     locale: "default",
      //     text: greeting.text
      //   });
      // }
      greetings.push(this.getGreetingText(locale));
    }

    return {
      greeting: greetings
    };
  }

  getPersistentMenu() {
    let menuItems = [];

    for (let locale of locales) {
      menuItems.push(this.getMenuItems(locale));
    }

    console.log({ menuItems }, "menuItems");
    return {
      persistent_menu: menuItems
    };
  }

  getGreetingText(locale) {
    // let param = locale === "en_US" ? "default" : locale;
    let param = locale === "th_TH" ? "default" : locale;

    i18n.setLocale(locale);
    let localizedGreeting = {
      locale: param,
      text: i18n.__("profile.greeting", {
        user_first_name: "{{user_first_name}}"
      })
    };

    console.log({ localizedGreeting });
    return localizedGreeting;
  }

  getMenuItems(locale) {
    let param = locale === "en_US" ? "default" : locale;

    i18n.setLocale(locale);

    let localizedMenu = {
      locale: param,
      composer_input_disabled: false,
      call_to_actions: [
        {
          title: i18n.__("menu.order"),
          type: "postback",
          payload: "TRACK_ORDER"
        },
        {
          title: i18n.__("menu.help"),
          type: "postback",
          payload: "CARE_HELP"
        },
        {
          title: i18n.__("menu.suggestion"),
          type: "postback",
          payload: "CURATION"
        },
        {
          type: "web_url",
          title: i18n.__("menu.shop"),
          url: config.shopUrl,
          webview_height_ratio: "full"
        }
      ]
    };

    console.log({ localizedMenu });
    return localizedMenu;
  }

  getWhitelistedDomains() {
    let whitelistedDomains = {
      whitelisted_domains: config.whitelistedDomains
    };

    console.log({ whitelistedDomains });
    return whitelistedDomains;
  }
};
