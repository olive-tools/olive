import { Person } from "./person";

export class Tour {
    constructor(
        readonly tourName: string,
        readonly tourDate: String,
        readonly driver: Person,
        readonly passenger: Person
    ) { }
}
