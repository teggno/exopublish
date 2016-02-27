import { readFile } from "fs";

export function readFilePromise(filename: string) {
    return new Promise<Buffer>((resolve, reject) => {
        readFile(filename, (err, data) => {
            if (err) return reject(err);
            resolve(data);
        });
    });
}

export function clone<T>(source: T): T {
    return JSON.parse(JSON.stringify(source));
}
