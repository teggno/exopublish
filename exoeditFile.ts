"use strict";

import * as fs from "fs";
import * as path from "path";
import { MappingDto, Mappings } from "./mappings";

/**
 * @param directory full path of the directory containing the exoedit.json file.
 */
export function getExoeditFile(directory: string, userName: string, password: string): Promise<ExoeditFile> {
    const filePath = path.join(directory, "exoedit.json");
    return getExoeditFileDto(filePath)
        .then(exoeditFileDto => new ExoeditFileImpl(filePath, userName, password, exoeditFileDto));
}

export interface ExoeditFile {
    mappings: Mappings;
    domain: string;
    save: () => Thenable<void>;
}

class ExoeditFileImpl implements ExoeditFile {
    private _mappings: Mappings;
    private _domain: string;

    constructor(private filePath: string, userName: string, password: string, exoeditFileDto?: ExoeditFileDto) {
        if (!exoeditFileDto) exoeditFileDto = {};

        this._mappings = exoeditFileDto.mapping
            ? new Mappings(path.dirname(filePath), exoeditFileDto.mapping)
            : new Mappings(path.dirname(filePath));

        this._domain = exoeditFileDto.domain;
    }

    get mappings() {
        return this._mappings;
    }

    set domain(value: string){
        this._domain = value;
    }

    get domain() {
        return this._domain;
    }

    save() {
        return getExoeditFileDto(this.filePath).then(dto => {
            if (!this._mappings.isEmpty) {
                dto.mapping = this._mappings.Serialize();
            }

            if (this._domain) {
                dto.domain = this._domain;
            }

            const json = JSON.stringify(dto, null, 2);
            const filePath = this.filePath;

            return new Promise<void>((resolve, reject) => {
                const saveCallback = err => {
                    if (err) return reject("Could not save exoedit.json file");
                    console.log("Saved exoedit.json file");
                    resolve();
                };

                if (json && json !== "{}") {
                    fs.writeFile(filePath, json, saveCallback);
                }
                else {
                    // nothing to write, check if file exists to not create it unnecessarily
                    fs.access(filePath, fs.R_OK, err => {
                        if (err) return resolve();
                        fs.writeFile(filePath, "{}", saveCallback);
                    });
                }
            });
        });
    }
}


function getExoeditFileDto(filePath: string) {
    return new Promise<ExoeditFileDto>((resolve, reject) => {
        fs.access(filePath, fs.R_OK, err => {
            if (err) return resolve({});

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    return reject(`Could not read file "${filePath}"`);
                }

                const content = data.toString();
                try {
                    const json = JSON.parse(content);
                    resolve(json);
                }
                catch (error) {
                    console.error(error);
                    reject("Error parsing exoedit.json file");
                }
            });
        });
    });
}

interface ExoeditFileDto {
    domain?: string;
    mapping?: MappingDto;
}

