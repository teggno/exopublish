export interface ExositeDashboardService {
    getDashboard(dashboardId: string): Promise<ExositeDashboard>;
    updateDashboard(dashboardId: string, dashboard): Promise<any>;
}

export interface ExositeDashboard {
    id: string;
    name: string;
    portalId: string;
    config: {
        widgets: {[id: number]: DashboardWidget}
    };
}

export interface DashboardWidget {
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

export interface ExoisteDomainWidgetService {
    getDomainWidgetScript(widgetScriptId: string): Promise<ExositeDomainWidgetScript>;
    updateDomainWidgetScript(widgetScriptId: string, widgetScript: any): Promise<any>;
}

export interface ExositeDomainWidgetScript {
    code: string;
    description: string;
    id: string;
    name: string;
}

export interface ExositeLuaScriptUploader {
    (scriptRid: string, scriptCode: string): Promise<void>;
}

export interface Mapper {
    setDomainWidgetScriptMapping: (path: string, id: string) => void;
    setPortalWidgetScriptMapping: (path: string, dashboardId: string, title: string) => void;
    setLuaDeviceScriptMapping: (path: string, rid: string, portalId: string) => void;
}

export interface ScriptSource {
    getScript: () => Thenable<string>;
    setMapping: (path: string, mappings: Mapper) => void;
    upload: (newScript: string) => Thenable<void>;
    getTitle(): string;
    domain: string;
}