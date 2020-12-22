import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { VideoTexture } from "@babylonjs/core/Materials/Textures/videoTexture";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { DataEvent } from "app/controllers/DataEvent";
import { EntityComponent } from "app/framework/entity/EntityComponent";
import { GameEvents, VideoData } from "../AppData";
import { ARControllerComponent } from "./ARControllerComponent";
import { ModelRendererComponent } from "./ModelRendererComponent";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";

export class VideoControllerComponent extends EntityComponent {
    static NAME: string = "VideoControllerComponent";

    private _root: AbstractMesh;

    public get root(): AbstractMesh {
        return this._root;
    }

    private data: VideoData;

    private _videoMesh: AbstractMesh;

    private _baseURL: string;

    private _videoTexture: VideoTexture;

    public get baseURL(): string {
        return this._baseURL;
    }

    constructor(d: VideoData, base: string) {
        super(VideoControllerComponent.NAME);
        this.data = d;
        this._baseURL = base;
        this._root = new AbstractMesh("video-root");

    }

    public getData(): VideoData {
        return this.data;
    }

    public hasVideo(): boolean {
        return (this._videoMesh != null);
    }

    public addVideoPlayerMesh(videoMesh: AbstractMesh) {
        this._videoMesh = videoMesh;
        this._videoMesh.parent = this._root;
        this._videoMesh.setEnabled(false);
        this._videoTexture = (this._videoMesh.material as StandardMaterial).diffuseTexture as VideoTexture;
    }

    public onAdd(): void {
        this.owner.dispatcher.addEventListener(ARControllerComponent.AR_DISPLAY_EVENT, this.handleDisplayEntity.bind(this));
    }

    private handleDisplayEntity(event: DataEvent): void {
        this.owner.dispatcher.dispatchEvent(new DataEvent(GameEvents.DISPLAY_VIDEO_BUTTON, { entity: this.owner, visible: event.data }));
        if (!event.data) {
            // stop video
            this._videoTexture.video.pause();
            this._videoTexture.video.currentTime = 0;
            this._videoMesh.setEnabled(false);
            // this._videoTexture.video.play();
        }
    }

    //https://doc.babylonjs.com/divingDeeper/materials/using/videoTexture
    public playVideo(value: boolean): void {
        this._videoMesh.setEnabled(value);
        if (value) {
            this._videoTexture.video.play();
        } else {
            this._videoTexture.video.pause();
            this._videoTexture.video.currentTime = 0;
        }
        this.owner.dispatcher.dispatchEvent(new DataEvent(ModelRendererComponent.MODEL_ENABLED_EVENT, !value));
    }
}