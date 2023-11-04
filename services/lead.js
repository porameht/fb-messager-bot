"use strict";

// Imports dependencies
const Response = require("./response"),
  GraphApi = require("./graph-api"),
  config = require("./config"),
  i18n = require("../i18n.config");

module.exports = class Lead {
  constructor(user, webhookEvent) {
    this.user = user;
    this.webhookEvent = webhookEvent;
  }

  handleReferral(type) {
    switch (type) {
      case "LEAD_COMPLETE":
        return this.responseForLeadComplete();
      case "LEAD_INCOMPLETE":
        return null;
    }

    return;
  }

  responseForLeadComplete() {
    var responses = [
      Response.genTextWithPersona(
        i18n.__("wholesale_leadgen.intro", {
          userFirstName: this.user.firstName,
          agentFirstName: config.personaSales.name,
          topic: i18n.__("care.order")
        }),
        config.personaSales.id
      ),
      Response.genTextWithPersona(i18n.__("care.end"), config.personaSales.id)
    ];
    responses[0].delay = 4000;
    responses[1].delay = 6000;
    return responses;
  }

  handlePayload(payload) {
    let response;

    switch (payload) {
      case "WHOLESALE_LEAD_AD":
        response = [
          Response.genText(
            i18n.__("wholesale_leadgen.lead_intro", {
              userFirstName: this.user.firstName
            })
          ),
          Response.genQuickReply(i18n.__("wholesale_leadgen.lead_question"), [
            {
              title: i18n.__("common.yes"),
              payload: "WHOLESALE_LEAD_YES"
            },
            {
              title: i18n.__("common.no"),
              payload: "WHOLESALE_LEAD_NO"
            }
          ])
        ];
        break;

      case "WHOLESALE_LEAD_YES":
        GraphApi.reportLeadSubmittedEvent(this.user.psid);
        response = [
          Response.genText(i18n.__("wholesale_leadgen.lead_qualified"))
        ];
        response.concat(this.responseForLeadRef());
        break;

      case "WHOLESALE_LEAD_NO":
        response = [
          Response.genText(i18n.__("wholesale_leadgen.lead_disqualified"))
        ];
        response.concat(Response.genNuxMessage(this.user));
        break;
    }

    return response;
  }
};
