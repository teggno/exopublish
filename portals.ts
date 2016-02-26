"use strict";

import Exosite from "./Ex2";
import { ExositeDashboard, DashboardWidget, ExoisteDomainWidgetService, ExositeLuaScriptUploader, ScriptSource, Mapper } from "./ints";
import { PortalWidgetScript, Dashboard } from "./dashboards";

function getPortalWidgetConfig(widget: DashboardWidget, dashboard: ExositeDashboard) {
    return {
        title: widget.title,
        script: widget.script,
        dataSourceRids: widget.rids,
        dashboard: {
            id: dashboard.id,
            portalId: dashboard.portalId
        },
        limit: widget.limit
    };
}

export class DomainWidgetScript implements ScriptSource {
    constructor(private originDomain: string, private title: string, private id: string, private exosite: ExoisteDomainWidgetService) {
    }

    public getTitle() {
        return this.title;
    }

    public getScript() {
        return this.exosite.getDomainWidgetScript(this.id).then(so => so.code);
    }

    public get domain() {
        return this.originDomain;
    }

    public setMapping(path: string, target: Mapper) {
        target.setDomainWidgetScriptMapping(path, this.id);
    }

    public upload(newScript: string) {
        const uploader = DomainWidgetScript.getUploader(this.exosite, this.id);
        return uploader(newScript);
    }

    public static getUploader(service: ExoisteDomainWidgetService, id: string) {
        return (newScript: string) => {
            return service.getDomainWidgetScript(id)
            .then(so => {
                so.code = newScript;
                return service.updateDomainWidgetScript(id, so).then(() => { return; });
            });
        };
    }
}


export class LuaScript implements ScriptSource {
    constructor(private originDomain: string, private name: string, private rid: string, private portalId: string, private script: string, private exosite: ExositeLuaScriptUploader) {
    }

    public getTitle() {
        return this.name;
    }

    public getScript() {
        return Promise.resolve(this.script);
    }

    public get domain() {
        return this.originDomain;
    }

    public setMapping(path: string, mappings: Mapper) {
        mappings.setLuaDeviceScriptMapping(path, this.portalId, this.rid);
    }

    public upload(newScript: string) {
        return this.exosite(this.rid, newScript);
    }
}

