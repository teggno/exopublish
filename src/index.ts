import { readFilePromise } from "./utilities";
import { PublishArgs } from "./publishArgs";
import { publishDomainWidget, DomainWidget } from "./domainWidget";
import { publishPortalWidget, PortalWidget } from "./portalWidget";
import { publishLua, LuaDeviceScript } from "./lua";

/**
 * @param relativePath workspace relative path of the script to publish
 * @param script script code to publish  
 * @param userName Exosite user name
 * @param password Exosite password
 */
export function publishOne(relativePath: string, script: string|Buffer, userName: string, password: string): Promise<void> {
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

            return ifFound(relativePath, config.mappings)
                .executeAppropriate(
                    publishDomainWidget(publishArgs),
                    publishPortalWidget(publishArgs),
                    publishLua(publishArgs)
                );
        });
}

export function getDomainWidgets(): Promise<string[]> {
    return getConfig()
        .then(config => config.mappings.widget.domain.map(w => w.path));
}

export function getPortalWidgets(): Promise<string[]> {
    return getConfig()
        .then(config => config.mappings.widget.portal.map(w => w.path));
}

export function getDeviceLuaScripts(): Promise<string[]> {
    return getConfig()
        .then(config => config.mappings.lua.device.map(w => w.path));
}

function getConfig() {
    return readFilePromise("./Exoedit.json")
        .then(file => {
            const config = <Config>file.toJSON();
            if (!config.domain) throw new Error("config file must include a \"domain\" property.");
            if (!config.mappings || !config.mappings) throw new Error("config file must include a \"mapping\".");

            return config;
        });
}

function ifFound(relativePath: string, allMmappings: Mappings) {
    const domainWidget = findDomainWidget(allMmappings, relativePath);
    const portalWidget = findPortalWidget(allMmappings, relativePath);
    const luaScript = findLua(allMmappings, relativePath);

    if (domainWidget || portalWidget || luaScript)
        return {
            executeAppropriate<T>(
                domainWidgetHandler: DomainWidgetHandler<T>,
                portalWidgetHandler: PortalWidgetHandler<T>,
                luaHandler: LuaHandler<T>
            ) {
                return domainWidget
                    ? domainWidgetHandler(domainWidget)
                    : (portalWidget
                        ? portalWidgetHandler(portalWidget)
                        : luaHandler(luaScript));
            }
        };
    else
        throw `Could not find mapping for "${relativePath}"`;
}

function findDomainWidget(mappings: Mappings, relativePath: string) {
    return mappings && mappings.widget && mappings.widget.domain
        ? mappings.widget.domain.find(mapping => mapping.path === relativePath)
        : null;
}

function findPortalWidget(mappings: Mappings, relativePath: string) {
    return mappings && mappings.widget && mappings.widget.portal
        ? mappings.widget.portal.find(mapping => mapping.path === relativePath)
        : null;
}

function findLua(mappings: Mappings, relativePath: string) {
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
    mappings: Mappings;
}

interface Mappings {
    lua?: {
        device: LuaDeviceScript[]
    };
    widget?: {
        domain?: DomainWidget[];
        portal?: PortalWidget[];
    };
}
