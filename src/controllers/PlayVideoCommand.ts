import { ARCharacterManager } from "app/models/ARCharacterManager";
import { VideoControllerComponent } from "app/models/components/VideoControllerComponent";
import { GUIViewMediator } from "app/views/GUIViewMediator";
import { Command } from "./Command";


export class PlayVideoCommand extends Command {

    public execute(): void {
        let characterManager: ARCharacterManager = this.context.characterManager;
        let videoComponent: VideoControllerComponent = characterManager.targetEntity.getComponent(VideoControllerComponent) as VideoControllerComponent;
        videoComponent.playVideo(true);

        let guiMediator : GUIViewMediator = this.context.GUIViewMediator;
        guiMediator.displayPlayButton(false);
    }
}