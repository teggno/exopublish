import { PublishArgs } from "./publishArgs";
import { updateDomainWidgetScript } from "./exosite";

export function publishDomainWidget(args: PublishArgs) {
    return (widget: DomainWidget) => updateDomainWidgetScript(args, widget.id, args.script);
}

export interface DomainWidget {
    path: string;
    id: string;
}