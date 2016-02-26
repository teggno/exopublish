"use strict";

import { clone } from "../common/utilities";
import { minify } from "../luaBasicMin";
import { DomainWidgetScript, LuaScript } from "./portals";
import { PortalWidgetScript } from "./dashboards";
import { Mapper, ExoisteDomainWidgetService, ExositeDashboardService } from "./ints";
import { readFile } from "fs";
import { resolve} from "path";
import Ex2 from "./Ex2";

const luamin = require("luamin");

export class Mappings implements Mapper {
    private deviceLuaScriptMappings: LuaDeviceScriptMapping[] = [];
    private domainWidgetScriptMappings: DomainWidgetScriptMapping[] = [];
    private portalWidgetScriptMappings: PortalWidgetScriptMapping[] = [];

    constructor(private ex2: Ex2, private path: string, source?: MappingDto) {
        if (!source) return;

        if (source.lua && source.lua.device) {
            this.deviceLuaScriptMappings = clone(source.lua.device);
        }
        if (source.widget && source.widget.domain) {
            this.domainWidgetScriptMappings = clone(source.widget.domain);
        }
        if (source.widget && source.widget.portal) {
            this.portalWidgetScriptMappings = clone(source.widget.portal);
        }
    }

    setLuaDeviceScriptMapping(path: string, portalId: string, rid: string) {
        let item: LuaDeviceScriptMapping = this.find(this.deviceLuaScriptMappings, path);
        if (item) {
            item.portalId = portalId;
            item.rid = rid;
        }
        else {
            item = { path: path, rid: rid };
            this.deviceLuaScriptMappings.push(item);
        }
    }

    setDomainWidgetScriptMapping(path: string, id: string) {
        let item: DomainWidgetScriptMapping = this.find(this.domainWidgetScriptMappings, path);
        if (item) {
            item.id = id;
        }
        else {
            item = { path: path, id: id };
            this.domainWidgetScriptMappings.push(item);
        }
    }

    setPortalWidgetScriptMapping(path: string, dashboardId: string, widgetTitle: string) {
        let item: PortalWidgetScriptMapping = this.find(this.portalWidgetScriptMappings, path);
        if (item) {
            item.dashboardId = dashboardId;
            item.widgetTitle = widgetTitle;
        }
        else {
            item = { path: path, dashboardId: dashboardId, widgetTitle: widgetTitle };
            this.portalWidgetScriptMappings.push(item);
        }
    }

    get isEmpty(): boolean{
        return this.deviceLuaScriptMappings.length === 0
            && this.domainWidgetScriptMappings.length === 0
            && this.portalWidgetScriptMappings.length === 0;
    }

    private find<T extends HasPath>(haystack: T[], path: string): T {
        return haystack.find(item => path.toLowerCase() === item.path.toLowerCase());
    }

    public Serialize() {
        const result: MappingDto = {};

        // Comparer to sort the items in the output to have deterministic order (e.g. in case the resulting file will be source controlled)
        const comparer = (a: HasPath, b: HasPath) => a.path.localeCompare(b.path);

        if (this.deviceLuaScriptMappings.length !== 0)
            result.lua = { device: clone(this.deviceLuaScriptMappings).sort(comparer) };
        if (this.domainWidgetScriptMappings.length !== 0 || this.portalWidgetScriptMappings.length !== 0) {
            result.widget = {};
        }
        if (this.domainWidgetScriptMappings.length !== 0)
            result.widget.domain = clone(this.domainWidgetScriptMappings).sort(comparer);
        if (this.portalWidgetScriptMappings.length !== 0)
            result.widget.portal = clone(this.portalWidgetScriptMappings).sort(comparer);

        return result;
    }

    public getPublisher(relativePath: string) {
        const luaMapping = this.find(this.deviceLuaScriptMappings, relativePath);
        if (luaMapping) {
            return (newScript: string) => {
                if (luaMapping.minify === "basic") {
                    newScript = minify(newScript);
                }
                else if (luaMapping.minify === "full") {
                    newScript = luamin.minify(newScript);
                }
                return this.ex2.updateLuaScript(luaMapping.rid, newScript).then(() => {});
            };
        }

        const domainWidgetMapping = this.find(this.domainWidgetScriptMappings, relativePath);
        if (domainWidgetMapping) return DomainWidgetScript.getUploader(this.ex2, domainWidgetMapping.id);

        const portalWidgetMapping = this.find(this.portalWidgetScriptMappings, relativePath);
        if (portalWidgetMapping) return PortalWidgetScript.getUploader(this.ex2, portalWidgetMapping.dashboardId, portalWidgetMapping.widgetTitle);

        return undefined;
    }

    public getWidgetData(relativePath: string, live: (dashboardId: string, widgetTitle: string) => void, fake: () => void ) {
        const portalWidgetMapping = this.find(this.portalWidgetScriptMappings, relativePath);
        if (portalWidgetMapping) {
            return portalWidgetMapping.fake
                ? fake()
                : live(portalWidgetMapping.dashboardId, portalWidgetMapping.widgetTitle);
        }

        const domainWidgetMapping = this.find(this.domainWidgetScriptMappings, relativePath);
        if (domainWidgetMapping) {
            return fake();
        }
    }

    public isMapped(relativePath: string) {
        return !!this.getPublisher(relativePath);
    }

    public getLuaScriptInfo(relativePath: string) {
        const luaMapping = this.find(this.deviceLuaScriptMappings, relativePath);
        return luaMapping && luaMapping.portalId ? { portalId: luaMapping.portalId, rid: luaMapping.rid } : undefined;
    }

    public publishDomainWidgets() {
        const promises = this.domainWidgetScriptMappings.map(mapping => {
            const uploader = DomainWidgetScript.getUploader(this.ex2, mapping.id);
            return readFilePromise(resolve(this.path, mapping.path))
                .then(data => {
                    return uploader(data.toString());
                });
        });
        return Promise.all(promises);
    }

    public publishPortalWidgets() {
        const promises = this.portalWidgetScriptMappings.map(mapping => {
            const uploader = PortalWidgetScript.getUploader(this.ex2, mapping.dashboardId, mapping.widgetTitle);
            return readFilePromise(resolve(this.path, mapping.path))
                .then(data => {
                    return uploader( data.toString());
                });
        });
        return Promise.all(promises);
    }
}

function readFilePromise(path: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        readFile(path, (err, data) => {
            if (err) return reject(err);

            return resolve(data);
        });
    });
}

export interface MappingDto {
    lua?: {
        device: LuaDeviceScriptMapping[]
    };
    widget?: {
        domain?: DomainWidgetScriptMapping[];
        portal?: PortalWidgetScriptMapping[];
    };
}

interface HasPath {
    path: string;
}

interface LuaDeviceScriptMapping {
    path: string;
    rid: string;
    portalId?: string; // This is only saved to be able to display the lua script's debug log
    minify?: string;
}

interface DomainWidgetScriptMapping {
    path: string;
    id: string;
}

interface PortalWidgetScriptMapping {
    path: string;
    dashboardId: string;
    widgetTitle: string;
    fake?: boolean;
}