import { readFile } from "fs";



export function clone<T>(source: T): T {
    return JSON.parse(JSON.stringify(source));
}
