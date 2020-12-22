import { ICommand } from "app/framework/commands/EventCommandMap";
import { InsectaContext } from "app/InsectaContext";

export abstract class Command implements ICommand{
    public data: any;
	public context : InsectaContext;
	public abstract execute(): void;
}
