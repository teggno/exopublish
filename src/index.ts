import { PublishArgs } from "./publishArgs";
import { publishDomainWidget, DomainWidget } from "./domainWidget";
import { publishPortalWidget, PortalWidget } from "./portalWidget";
import { publishLua, LuaDeviceScript } from "./lua";

export function configure(config: Config): Exopublish {
    if (!config.domain) throw new Error("config file must include a \"domain\" property");
    if (!config.mapping || !config.mapping) throw new Error("config file must include a \"mappings\" property");

    return {
        publishOne(relativePath: string, script: string|Buffer, userName: string, password: string): Promise<void> {
            const publishArgs: PublishArgs = {
                account: {
                    userName: userName,
                    password: password,
                },
                domain: config.domain,
                script: script
            };

            return ifFound(relativePath)
                .executeAppropriate(
                    publishDomainWidget(publishArgs),
                    publishPortalWidget(publishArgs),
                    publishLua(publishArgs)
                );
        },

        getDomainWidgets(): string[] {
            return getDomainWidgetMappings().map(m => m.path);
        },

        getPortalWidgets(): string[] {
            return getPortalWidgetMappings().map(m => m.path);
        },

        getDeviceLuaScripts(): string[] {
            return getDeviceLuaMappings().map(m => m.path);
        }
    };

    function ifFound(relativePath: string) {
        const domainWidget = findDomainWidget(relativePath);
        const portalWidget = findPortalWidget(relativePath);
        const luaScript = findLua(relativePath);

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

    function getDomainWidgetMappings() {
        return config.mapping.widget && config.mapping.widget.domain
            ? config.mapping.widget.domain
            : [];
    }

    function getPortalWidgetMappings() {
        return config.mapping.widget && config.mapping.widget.portal
            ? config.mapping.widget.portal
            : [];
    }

    function getDeviceLuaMappings() {
        return config.mapping.lua && config.mapping.lua.device
            ? config.mapping.lua.device
            : [];
    }

    function findDomainWidget(relativePath: string) {
        return getDomainWidgetMappings().find(mapping => mapping.path === relativePath);
    }

    function findPortalWidget(relativePath: string) {
        return getPortalWidgetMappings().find(mapping => mapping.path === relativePath);
    }

    function findLua(relativePath: string) {
        return getDeviceLuaMappings().find(mapping => mapping.path === relativePath);
    }
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

export interface Config {
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

export interface Exopublish {
    /**
     * @param relativePath workspace relative path of the script to publish
     * @param script script code to publish  
     * @param userName Exosite user name
     * @param password Exosite password
     */
    publishOne(relativePath: string, script: string|Buffer, userName: string, password: string): Promise<void>;
    getDomainWidgets(): string[];
    getPortalWidgets(): string[];
    getDeviceLuaScripts(): string[];
}

