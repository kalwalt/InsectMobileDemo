import { EntityComponent } from "../../framework/entity/EntityComponent";
import { CharacterData, Vector2Data } from "../AppData";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Vector3 } from "@babylonjs/core/Maths/math";
import "@babylonjs/core/Meshes/meshBuilder"
import "@babylonjs/core/Materials/standardMaterial";
import { degreesToRadians } from "app/framework/utils/Utils";
import { DataEvent } from "app/controllers/DataEvent";

export class ModelRendererComponent extends EntityComponent {

    static NAME: string = "ModelRendererComponent";

    static MODEL_ENABLED_EVENT : string = "ModelRendererEvent:ModelEnabledEvent";

    public model: AbstractMesh;

    private _root: AbstractMesh;

    public get root(): AbstractMesh {
        return this._root;
    }

    private data: CharacterData;

    constructor(model: AbstractMesh, d: CharacterData) {
        super(ModelRendererComponent.NAME);

        this.data = d;

        this._root = new AbstractMesh("model-root");
        // this.root = Mesh.CreateBox("model-root",1, scene);
        this.root.receiveShadows = true;
        this.model = model;
        let scale: number = this.data.scale;
        this.root.scaling.set(scale, scale, scale);

        let offset : Vector2Data = this.data.offset;
        this.root.position.set(offset.x, offset.y, 0);

        this.model.rotate(Vector3.Left(), degreesToRadians(-90));
        this.model.parent = this._root;
    }

    public onAdd(): void{
        this.owner.dispatcher.addEventListener(ModelRendererComponent.MODEL_ENABLED_EVENT, this.handleModelEnabled.bind(this));
    }

    public handleModelEnabled( event:DataEvent):void{
        this.enabled = event.data;
    }

    public set enabled(value: boolean) {
        super.enabled = value;
        this.root.setEnabled(value);
    }

}

export interface IModelRendererComponent {

}