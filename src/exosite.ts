import fetch, {expectStatus200 } from "./fetch";

export function updateDomainWidgetScript(args: CommonArgs, widgetScriptId: string, data: any): Promise<void> {
    const options = {
        auth: args.account,
        method: "PUT",
        url: getUrl(args.domain, "widget-scripts/" + widgetScriptId),
        json: true,
        body: data
    };
    return fetch(options)
        .then(expectStatus200)
        .then(() => {});
}

export function getDashboard(args: CommonArgs, dashboardId: string): Promise<ExositeDashboard> {
    const options = {
        auth: args.account,
        url: getUrl(args.domain, "dashboards/" + dashboardId)
    };
    return fetch(options)
        .then(expectStatus200)
        .then(result => {
            return JSON.parse(result.body);
        });
}

export function updateLuaScript(args: CommonArgs, rid: string, script: string|Buffer): Promise<void> {
    const options = {
        auth: args.account,
        method: "PUT",
        url: getUrl(args.domain, "scripts/" + rid),
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
        .then(expectStatus200).then(() => {});
}

export function updateDashboard(args: CommonArgs, dashboardId: string, data: any) {
    const options = {
        auth: args.account,
        method: "PUT",
        url: getUrl(args.domain, "dashboards/" + dashboardId),
        json: true,
        body: data
    };

    return fetch(options)
        .then(expectStatus200);
}

function getUrl(domain: string, suffix: string) {
    return "https://" + domain + "api/portals/v1/" + suffix;
}

export interface CommonArgs {
    domain: string;
    account: {
        userName: string;
        password: string;
    };
}

export interface ExositeDashboard {
    id: string;
    name: string;
    portalId: string;
    config: {
        widgets: {[id: number]: ExoisteDashboardWidget}
    };
}

export interface ExoisteDashboardWidget {
    title: string;
    script: string;
    WidgetScriptID: string;
    /**
     * Contains the rids of the dataports that have been selected for the widget.
     */
    rids: string[];
    limit: {
        /**
         * count|duration
         */
        type: string;
        /**
         * minute|hour|day|week
         */
        unit: string;
        value: number;
    };
}