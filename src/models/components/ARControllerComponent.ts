
import { EntityComponent } from "app/framework/entity/EntityComponent";
import { ITicked } from "app/framework/TimeManager";
import { CharacterData } from "../AppData";
import { StateMachine } from "app/framework/StateMachine";
import { StateMachineComponent } from "./StateMachineComponent";
import { ExitState } from "../states/ExitState";
import { DelayableSignalFilter } from "app/framework/utils/DelayableSignalFilter";
import { IdleState } from "../states/IdleState";
import { IMediaNode } from "app/arnft/core/NFTEntity";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { Matrix, Quaternion, Vector3 } from "@babylonjs/core/Maths/math";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { DataEvent } from "app/controllers/DataEvent";
import { OneEuroFilterVector3 } from "app/framework/utils/OneEuroFilter";

export class ARControllerComponent extends EntityComponent implements ITicked, IMediaNode {

    static NAME: string = "ARControllerComponent";

    static AR_DISPLAY_EVENT: string = "EntityEvent:ARDisplayEvent";

    public data: CharacterData;

    private delayExitCheck: DelayableSignalFilter;

    private delayEnterCheck: DelayableSignalFilter;

    private isVisible: boolean;

    private _stateMachine: StateMachine;

    protected world: any;

    private _hasFound: boolean = false;

    // private _interpolationFactor: number = 15;

    private _lastTranslation: Vector3;

    private _frameDrops: number = 0;

    private _root: AbstractMesh;

    private _deltaAccuracy: number = 10;

    private _groundPlane: Mesh;

    private _positionFilter: OneEuroFilterVector3;

    private _rotationFilter: OneEuroFilterVector3;

    public filterFrequency: number = 30.0;
    public filterMinCutoff: number = 1.0;
    public filterBeta: number = 0.0;
    public filterDcutoff: number = 1.0;

    constructor(data: CharacterData, root: AbstractMesh) {
        super(ARControllerComponent.NAME);
        this.data = data;

        this.delayEnterCheck = new DelayableSignalFilter(2);
        this.delayExitCheck = new DelayableSignalFilter(0);

        this._root = root;

        this._positionFilter = new OneEuroFilterVector3(this.filterFrequency);
        this._rotationFilter = new OneEuroFilterVector3(this.filterFrequency * 2);
    }

    public onAdd(): void {
        this._stateMachine = (this.owner.getComponent(StateMachineComponent.NAME) as StateMachineComponent).stateMachine;

        this.isVisible = false;
    }

    public found(msg: any): void {

        this.world = msg;
        if (msg) {
            if (this.delayEnterCheck.Update(true) && this.isVisible == false) {
                // dispaly in scene
                this.isVisible = true;
                this._stateMachine.GoToState(IdleState.NAME);
                this.owner.dispatcher.dispatchEvent(new DataEvent(ARControllerComponent.AR_DISPLAY_EVENT, true));
            }
            this.delayExitCheck.Update(false);
        } else {
            if (this.delayExitCheck.Update(true) && this.isVisible == true) {
                //  hide from scene
                this.isVisible = false;
                this._stateMachine.GoToState(ExitState.NAME)
                this.owner.dispatcher.dispatchEvent(new DataEvent(ARControllerComponent.AR_DISPLAY_EVENT, false));
            }
            this.delayEnterCheck.Update(false);
        }
    }

    public addGroundPlane(mesh: Mesh): void {
        this._groundPlane = mesh;
        this._groundPlane.parent = this._root;
    }

    public update(): void {
        if (!this.world) {
            this._hasFound = false;
            this._frameDrops = 0;
        } else {
            let worldMatrix: Matrix = Matrix.FromArray(this.getArrayMatrix(this.world));

            if (!this._hasFound) {
                // for (var i = 0; i < 16; i++) {
                //     this.trackedMatrix.interpolated[i] = this.world[i];
                // }
                this._hasFound = true;
                this._lastTranslation = worldMatrix.getTranslation();
            }
            else {
                let _currentTranslation: Vector3 = worldMatrix.getTranslation();

                if (Math.abs(Vector3.Distance(_currentTranslation, this._lastTranslation)) > this._deltaAccuracy) {
                    this._frameDrops += 1;
                    if (this._frameDrops > 3) {
                        this._lastTranslation = _currentTranslation;
                    }
                    return;
                }
                this._frameDrops = 0;
                this._lastTranslation = _currentTranslation;
                // for (var i = 0; i < 16; i++) {
                //     this.trackedMatrix.delta[i] = this.world[i] - this.trackedMatrix.interpolated[i];
                //     this.trackedMatrix.interpolated[i] = this.trackedMatrix.interpolated[i] + (this.trackedMatrix.delta[i] / this._interpolationFactor);
                // }
            }
            // let matrix: Matrix = Matrix.FromArray(this.getArrayMatrix(this.world));

            this._positionFilter.UpdateParams(this.filterFrequency, this.filterMinCutoff, this.filterBeta, this.filterDcutoff);
            this._rotationFilter.UpdateParams(this.filterFrequency * 2, this.filterMinCutoff, this.filterBeta, this.filterDcutoff);

            let matrix: Matrix = worldMatrix;

            let rotMatrix: Matrix = matrix.getRotationMatrix();
            let rotation: Quaternion = new Quaternion().fromRotationMatrix(rotMatrix);
            this._root.rotation = this._rotationFilter.Filter(rotation.toEulerAngles());

            let pos = Vector3.TransformCoordinates(new Vector3(0, 0, 0), matrix);

            this._root.setAbsolutePosition(this._positionFilter.Filter(pos));
        }
    }

    protected getArrayMatrix(value: any): any {
        var array: any = [];
        for (var key in value) {
            array[key] = value[key]; //.toFixed(4);
        }
        return array;
    }
}