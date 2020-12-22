import { Command } from "./Command";

export class DisplayModelCommand extends Command {

    constructor() {
        super();
    }

    public execute(): void {
        console.log("display model command has been called");
    }
}