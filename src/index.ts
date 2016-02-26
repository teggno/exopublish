import { readFilePromise } from "./utilities";
import { PublishArgs } from "./publishArgs";
import { publishDomainWidget, DomainWidget } from "./domainWidget";
import { publishPortalWidget, PortalWidget } from "./portalWidget";
import { publishLua, LuaDeviceScript } from "./lua";

export function publishOne(relativePath: string, script: string, userName: string, password: string): Promise<void> {
    return getConfig()
        .then(config => {
            const publishArgs: PublishArgs = {
                account: {
                    userName: userName,
                    password: password,
                },
                domain: config.domain,
                script: script
            };

            return doStuffWithMapping(
                config.mapping,
                relativePath,
                publishDomainWidget(publishArgs),
                publishPortalWidget(publishArgs),
                publishLua(publishArgs)
            );
        });
}

export function publishDomainWidgets(userName: string, password: string) {
}

export function publishPortalWidgets(relativePath: string, userName: string, password: string) {
}

function getConfig() {
    return readFilePromise("./Exoedit.json")
        .then(file => {
            const config = <Config>file.toJSON();
            if (!config.domain) throw new Error("config file must include a \"domain\" property.");
            if (!config.mapping || !config.mapping) throw new Error("config file must include a \"mapping\".");

            return config;
        });
}

function doStuffWithMapping<T>(
    mappings: Mappings,
    relativePath: string,
    domainWidgetHandler: DomainWidgetHandler<T>,
    portalWidgetHandler: PortalWidgetHandler<T>,
    luaHandler: LuaHandler<T>) {

    const domainWidgetMapping = findDomainWidgetMapping(mappings, relativePath);
    if (domainWidgetMapping) {
        return domainWidgetHandler(domainWidgetMapping);
    }

    const portalWidgetMapping = findPortalWidgetMapping(mappings, relativePath);
    if (portalWidgetMapping) {
        return portalWidgetHandler(portalWidgetMapping);
    }

    const luaScriptMapping = findLuaMapping(mappings, relativePath);
    if (luaScriptMapping) {
        return luaHandler(luaScriptMapping);
    }

    throw `Could not find mapping for "${relativePath}"`;
}

function findDomainWidgetMapping(mappings: Mappings, relativePath: string) {
    return mappings && mappings.widget && mappings.widget.domain
        ? mappings.widget.domain.find(mapping => mapping.path === relativePath)
        : null;
}

function findPortalWidgetMapping(mappings: Mappings, relativePath: string) {
    return mappings && mappings.widget && mappings.widget.portal
        ? mappings.widget.portal.find(mapping => mapping.path === relativePath)
        : null;
}

function findLuaMapping(mappings: Mappings, relativePath: string) {
    return mappings && mappings.lua && mappings.lua.device
        ? mappings.lua.device.find(mapping => mapping.path === relativePath)
        : null;
}

interface DomainWidgetHandler<T> {
    (domainWidget: DomainWidget): T;
}

interface PortalWidgetHandler<T> {
    (portalWidget: PortalWidget): T;
}

interface LuaHandler<T> {
    (lua: LuaDeviceScript): T;
}

interface Config {
    domain: string;
    mapping: Mappings;
}

export interface Mappings {
    lua?: {
        device: LuaDeviceScript[]
    };
    widget?: {
        domain?: DomainWidget[];
        portal?: PortalWidget[];
    };
}






