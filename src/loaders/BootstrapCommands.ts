import { DisplayModelCommand } from "app/controllers/DisplayModelCommand";
import { DisplayVideoCommand } from "app/controllers/DisplayVideoCommand";
import { PlayVideoCommand } from "app/controllers/PlayVideoCommand";
import { EventCommandMap, ICommand } from "app/framework/commands/EventCommandMap";
import { InsectaContext } from "app/InsectaContext";
import { GameEvents } from "app/models/AppData";

export function BootstrapCommands(context:InsectaContext) : void{

    let commandMap : EventCommandMap = context.commandManager;
    commandMap.mapCommand(GameEvents.DISPLAY_VIDEO_EVENT, DisplayVideoCommand);
    commandMap.mapCommand(GameEvents.DISPLAY_MODEL_EVENT, DisplayModelCommand);

    commandMap.mapCommand(GameEvents.PLAY_VIDEO_EVENT, PlayVideoCommand);
}