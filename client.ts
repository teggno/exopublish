import { getExoeditFile, ExoeditFile } from "./exoeditFile";
import Ex2 from "./Ex2";

export function publishAll(exoeditFilePath: string, userName: string, password: string) {
    return getExoeditFile(exoeditFilePath, userName, password)
        .then(file => {
            const ex = new Ex2(file.domain, userName, password);
            return Promise.all([
                file.mappings.publishDomainWidgets(),
                file.mappings.publishPortalWidgets()
            ]);
        });
}