import { PublishArgs } from "./publishArgs";
import { getDashboard, updateDashboard, ExositeDashboard } from "./exosite";

export function publishPortalWidget(args: PublishArgs) {
    return (widget: PortalWidget) => {
        return getDashboard(args, widget.dashboardId)
            .then(dashboard => {
                const index = findWidgetIndexByTitle(dashboard, widget.widgetTitle);
                dashboard.config.widgets[index].script = args.script.toString();
                updateDashboard(args, widget.dashboardId, { config: dashboard.config });
            });
    };
}

function findWidgetIndexByTitle(dashboard: ExositeDashboard, title: string): any {
    const widgets = dashboard.config.widgets;
    for (let id in widgets) {
        const widget = widgets[id];
        if (widget.title === title && !widget.WidgetScriptID) {
            return id;
        }
    }
    return -1;
}

export interface PortalWidget {
    path: string;
    dashboardId: string;
    widgetTitle: string;
    fake?: boolean;
}