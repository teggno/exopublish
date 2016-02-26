"use strict";

import Exosite from "./Ex2";
import { ExositeDashboard, ExositeDashboardService, ScriptSource, Mapper } from "./ints";

export interface Dashboard {
    portalWidgets: PortalWidgetScript[];
    name: string;
    id: string;
    portalId: string;
}

interface WidgetConfig {
    title: string;
    script: string;
    dashboard: {
        id: string;
        portalId: string;
    };
    dataSourceRids: string[];
}

export class PortalWidgetScript implements ScriptSource {
    constructor(private originDomain: string, private exosite: Exosite, private config: WidgetConfig) {
    }

    public getTitle() {
        return this.config.title;
    }

    public getScript() {
        return Promise.resolve(this.config.script);
    }

    public get domain() {
        return this.originDomain;
    }

    public setMapping(path: string, target: Mapper) {
        target.setPortalWidgetScriptMapping(path, this.config.dashboard.id, this.config.title);
    }

    public upload(newScript: string) {
        const uploader = PortalWidgetScript.getUploader(this.exosite, this.config.dashboard.id, this.config.title);
        return uploader(newScript);
    }

    private static findWidgetIndexByTitle(dashboard: ExositeDashboard, title: string) {
        const widgets = dashboard.config.widgets;
        for (let id in widgets) {
            const widget = widgets[id];
            if (widget.title === title && !widget.WidgetScriptID) {
                return id;
            }
        }
        return -1;
    }

    public static getUploader(dashboardService: ExositeDashboardService, dashboardId: string, widgetTitle: string) {
        return (newScript: string) => {
            return dashboardService.getDashboard(dashboardId)
                .then(dashboard => {
                    return new Promise<void>((resolve, reject) => {
                        const index = this.findWidgetIndexByTitle(dashboard,  widgetTitle);
                        if (index === -1) return reject(`Widget with Name "${widgetTitle}" not found in dashboard "${dashboard.name}"`);

                        dashboard.config.widgets[index].script = newScript;
                        dashboardService.updateDashboard(dashboard.id, { config: dashboard.config }).then(() => {
                            resolve();
                        });
                    });
            });
        };
    }
}