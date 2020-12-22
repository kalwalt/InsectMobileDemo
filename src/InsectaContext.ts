
import { AppJson, GameEvents } from "./models/AppData";
import appdata from "./appdata.json";
import { AudioManager } from "./framework/AudioManager";
import { TimeManager, wait } from "./framework/TimeManager";
import { URLHelper } from "./framework/utils/net/URLHelper";
import { SceneRendererBJS } from "./arnft-babylonjs/SceneRendererBJS";
import { CameraViewRenderer } from "./arnft/core/renderers/CamerViewRenderer";
import { ARCharacterManager } from "./models/ARCharacterManager";
import { GUIViewMediator } from "./views/GUIViewMediator";
import { BootstrapCommands } from "./loaders/BootstrapCommands";
import { EventCommandMap } from "./framework/commands/EventCommandMap";
import { Context } from "./framework/Context";

export class InsectaContext extends Context{
    public appData: AppJson = appdata as AppJson;

    // public eventDispatcher: EventTarget = new EventTarget();
    public sceneRenderer: SceneRendererBJS;

    public cameraView: CameraViewRenderer;

    public GUIViewMediator: GUIViewMediator;

    private _characterManager: ARCharacterManager;
    public get characterManager(): ARCharacterManager {
        return this._characterManager;
    }

    private _timeManager: TimeManager;
    public get timeManager(): TimeManager {
        return this._timeManager;
    }

    private _commandManager: EventCommandMap;
    public get commandManager(): EventCommandMap {
        return this._commandManager;
    }

    constructor(location: string) {
        super();
        URLHelper.initalize(location);
    }

    public async initialize(): Promise<boolean> {
        console.log("init insecta");
        this.GUIViewMediator = new GUIViewMediator(this.eventDispatcher, "https://sites.google.com/view/insectawebdemo/home");
        this.GUIViewMediator.initialize();

        // views
        this.cameraView = new CameraViewRenderer(document.getElementById("video") as HTMLVideoElement);
        await this.cameraView.initialize(this.appData.videoSettings).catch((error) => {
            this.GUIViewMediator.displayError(error);
            return Promise.reject(false);
        });

        this.sceneRenderer = new SceneRendererBJS(document.getElementById("canvas") as HTMLCanvasElement);
        await this.sceneRenderer.initialize().catch((error) => {
            this.GUIViewMediator.displayError(error);
            return Promise.reject(false);
        });

        await wait(1000);

        this._commandManager = new EventCommandMap(this);
        BootstrapCommands(this);

        this._characterManager = new ARCharacterManager(this);
        await this._characterManager.initalize(appdata.characters);

        this._timeManager = new TimeManager();
        this._timeManager.addTickedComponent(this.sceneRenderer);
        this._timeManager.addTickedComponent(this._characterManager);
        
        AudioManager.instance.initialize(appdata.sounds, this.sceneRenderer.scene);
        
        this.eventDispatcher.dispatchEvent(new Event(GameEvents.DISPLAY_VIDEO_EVENT));
        await wait(1000);
        this.startGame();
        await wait(100);

        return Promise.resolve(true);
    }

    public startGame(): void {
        console.log("start insecta ar");
        this._timeManager.initialize();
        this.GUIViewMediator.hideLoading();
    }
}