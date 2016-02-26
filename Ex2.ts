"use strict";

import fetch, {expectStatus200, Auth } from "../common/fetch";
import { concatWithSlash } from "../common/utilities";
import { ExositeDomainWidgetScript, ExositeDashboard } from "./ints";

export default class Ex2 {
    constructor(private domain: string, userName: string, password: string) {
        this.account = {
            userName: userName,
            password: password
        }
    }

    private account: Auth;

    public getDomainWidgetScript(widgetScriptId: string): Promise<ExositeDomainWidgetScript> {
        const options = {
            auth: this.account,
            url: this.getUrl("widget-scripts/" + widgetScriptId)
        };
        return fetch(options)
            .then(expectStatus200)
            .then(result => {
                return JSON.parse(result.body);
            });
    }

    public updateDomainWidgetScript(widgetScriptId: string, data: any) {
        const options = {
            auth: this.account,
            method: "PUT",
            url: this.getUrl("widget-scripts/" + widgetScriptId),
            json: true,
            body: data
        };
        return fetch(options)
            .then(expectStatus200);
    }

    public getDashboard(dashboardId: string): Promise<ExositeDashboard> {
        const options = {
            auth: this.account,
            url: this.getUrl("dashboards/" + dashboardId)
        };
        return fetch(options)
            .then(expectStatus200)
            .then(result => {
                return JSON.parse(result.body);
            });
    }

    public updateLuaScript(rid: string, script: string) {
        const options = {
            auth: this.account,
            method: "PUT",
            url: this.getUrl("scripts/" + rid),
            json: true,
            body: {
                info: {
                    description: {
                        rule: {
                            script: script
                        }
                    }
                }
            }
        };

        return fetch(options)
            .then(expectStatus200);
    }

    public updateDashboard(dashboardId: string, data: any) {
        const options = {
            auth: this.account,
            method: "PUT",
            url: this.getUrl("dashboards/" + dashboardId),
            json: true,
            body: data
        };

        return fetch(options)
            .then(expectStatus200);
    }

    private getUrl(suffix: string) {
        return concatWithSlash("https://" + this.domain, concatWithSlash("api/portals/v1", suffix));
    }
}
