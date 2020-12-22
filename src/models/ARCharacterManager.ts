import { VideoTexture } from "@babylonjs/core/Materials/Textures/videoTexture";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import { Color3, Color4, Vector3 } from "@babylonjs/core/Maths/math";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder";
import { Scene } from "@babylonjs/core/scene";
import { ARnft } from "app/arnft/ARnft";
import { NFTEntity } from "app/arnft/core/NFTEntity";
import { CameraViewRenderer } from "app/arnft/core/renderers/CamerViewRenderer";
import { DataEvent } from "app/controllers/DataEvent";
import { Entity } from "app/framework/entity/Entity";
import { ITicked } from "app/framework/TimeManager";
import { InsectaContext } from "app/InsectaContext";
import { CharacterFactoryBabylon } from "app/loaders/CharacterFactoryBabylon";
import { CharacterData, GameEvents, VideoData } from "./AppData";
import { CharacterEntity } from "./CharacterEntity";
import { ARControllerComponent } from "./components/ARControllerComponent";
import { VideoControllerComponent } from "./components/VideoControllerComponent";

export class ARCharacterManager implements ITicked {

    private _context: InsectaContext;

    private _data: CharacterData[];

    private _entities: Entity[] = [];

    private _ARNFT: ARnft;

    constructor(context: InsectaContext) {
        this._context = context;
    }

    public initalize(data: CharacterData[]): Promise<boolean> {
        this._data = data;

        let cameraView: CameraViewRenderer = this._context.cameraView;
        let workerURL: string = this._context.appData.workerURL;

        this._ARNFT = new ARnft(cameraView, this._context.appData.cameraDataURL, workerURL);

        let promises: Promise<boolean>[] = this._data.map((characterData: CharacterData) => {
            return new Promise<boolean>((resolve, reject) => {
                CharacterFactoryBabylon.createCharacterEntity(characterData, this._context).then((entity) => {

                    let arComponent: ARControllerComponent = entity.getComponent(ARControllerComponent) as ARControllerComponent;
                    let nftEntity: NFTEntity = new NFTEntity(arComponent, characterData.markerData.url, cameraView.getWidth(), cameraView.getHeight());
                    this._ARNFT.addNFTEntity(nftEntity);

                    this._entities.push(entity);
                    entity.dispatcher.addEventListener(GameEvents.DISPLAY_VIDEO_BUTTON, this.handleDisplayVideoButton.bind(this));
                    resolve(true);
                });
            });
        });


        return Promise.all(promises).then(async (result) => {
            // all characters created init arnft
            await this._ARNFT.initialize();
            return true;
        });
    }

    // example: for video playing
    public targetEntity: CharacterEntity;

    public handleDisplayVideoButton(event: DataEvent): void {
        this.targetEntity = event.data.entity as CharacterEntity;

        let videoComponent: VideoControllerComponent = this.targetEntity.getComponent(VideoControllerComponent) as VideoControllerComponent;
        if (videoComponent && !videoComponent.hasVideo()) {
            let videoData: VideoData = videoComponent.getData();
            let videoURL: string = videoComponent.baseURL + videoData.videoURL;
            videoComponent.addVideoPlayerMesh(this.createAndLoadVideo(videoURL));
        }

        this._context.eventDispatcher.dispatchEvent(new DataEvent(GameEvents.DISPLAY_VIDEO_BUTTON, event.data));
    }

    public createAndLoadVideo(videoURL: string): Mesh {

        let scene: Scene = this._context.sceneRenderer.scene;

        var videoBox = MeshBuilder.CreateBox("ANote0", { width: 7.646700, height: 5.726200, depth: 0.100000 }, scene);
        videoBox.position = Vector3.Zero();
        var mat = new StandardMaterial("ANote0Mat", scene);
        mat.diffuseColor = new Color3(0, 0, 0);
        videoBox.material = mat;
        var planeOpts = {
            height: 5.4762,
            width: 7.3967,
            sideOrientation: Mesh.BACKSIDE
        };
        var ANote0Video = MeshBuilder.CreatePlane("vplane", planeOpts, scene);
        var vidPos = (new Vector3(0, 0, 0.1)).addInPlace(videoBox.position);
        ANote0Video.position = vidPos;
        var ANote0VideoMat = new StandardMaterial("m", scene);
        var ANote0VideoVidTex = new VideoTexture("vidtex", videoURL, scene, null, null, null, { loop: false, autoPlay: false, autoUpdateTexture: true });
        ANote0VideoMat.diffuseTexture = ANote0VideoVidTex;
        ANote0VideoMat.specularColor = Color3.Black();
        ANote0VideoMat.specularPower = 0;
        ANote0VideoMat.roughness = 1;
        ANote0VideoMat.emissiveColor = Color3.White();
        ANote0Video.material = ANote0VideoMat;

        ANote0Video.scaling.set(50, 50, 50);
        ANote0Video.position.set(120, 120, 0);
        return ANote0Video;
    }

    public createGroundPlane(): void {

    }

    public update(): void {
        this._ARNFT.update();
        this._entities.forEach(entity => {
            entity.update();
        });
    }
}