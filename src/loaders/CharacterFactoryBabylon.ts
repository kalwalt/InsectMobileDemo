import { Entity } from "app/framework/entity/Entity";
import { CharacterData } from "app/models/AppData";
import { ModelRendererComponent } from "app/models/components/ModelRendererComponent";
import { CharacterControllerComponent } from "app/models/components/CharacterControllerComponent";
import { CharacterEntity } from "app/models/CharacterEntity";
import "@babylonjs/loaders/glTF/2.0";
import { URLHelper } from "app/framework/utils/net/URLHelper";
import { ARControllerComponent } from "app/models/components/ARControllerComponent";
import { AnimationControllerComponent } from "app/models/components/AnimationControllerComponent";
import { StateMachineComponent } from "app/models/components/StateMachineComponent";
import { StateMachine } from "app/framework/StateMachine";
import { DoNothingState } from "app/models/states/DoNothingState";
import { IdleState } from "app/models/states/IdleState";
import { AudioControllerComponent } from "app/models/components/AudioControllerComponent";
import { Scene } from "@babylonjs/core/scene";
import { ShadowGenerator } from "@babylonjs/core/Lights/Shadows/shadowGenerator";
import { AbstractMesh } from "@babylonjs/core/Meshes/abstractMesh";
import { AnimationPropertiesOverride } from "@babylonjs/core/Animations/animationPropertiesOverride";
import { SceneLoader } from "@babylonjs/core/Loading";
import { Skeleton } from "@babylonjs/core/Bones";
import { InsectaContext } from "app/InsectaContext";
import { SceneRendererBJS } from "app/arnft-babylonjs/SceneRendererBJS";
import { ExitState } from "app/models/states/ExitState";
import { Mesh } from "@babylonjs/core/Meshes/mesh";
import { ShadowOnlyMaterial } from "@babylonjs/materials/shadowOnly";
import "@babylonjs/core/Meshes/Builders/planeBuilder";
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial";
import "@babylonjs/core/Meshes/meshBuilder"
import { VideoControllerComponent } from "app/models/components/VideoControllerComponent";

export class CharacterFactoryBabylon {

    static createCharacterEntity(data: CharacterData, context: InsectaContext): Promise<Entity> {

        let sceneRenderer: SceneRendererBJS = context.sceneRenderer;
        let scene: Scene = sceneRenderer.scene;
        let shadowGenerator: ShadowGenerator = sceneRenderer.shadowGenerator;
        let eventDispatcher: EventTarget = context.eventDispatcher;

        return new Promise<Entity>((resolve, reject) => {
            SceneLoader.ImportMesh("", URLHelper.instance().resolveURL(data.modelURL), data.file, scene, (newMeshes, particleSystems, skeletons) => {
                // console.log("loading model: " + data.file);

                let model: AbstractMesh = newMeshes[0];

                shadowGenerator.addShadowCaster(model);

                let root = new AbstractMesh("mainroot-" + data.id, scene);

                let entity: CharacterEntity = new CharacterEntity(data.id);

                let modelRenderer: ModelRendererComponent = entity.addComponent(new ModelRendererComponent(model, data)) as ModelRendererComponent;
                modelRenderer.root.setParent(root);

                entity.addComponent(new CharacterControllerComponent(data));
                let arComponent: ARControllerComponent = entity.addComponent(new ARControllerComponent(data, root)) as ARControllerComponent;

                // create and add shadow effect

                let _groundPlane = Mesh.CreatePlane('ground', 250, scene);
                _groundPlane.position.set(150, 150, -10);
                _groundPlane.rotation.x = Math.PI;
                _groundPlane.material = new ShadowOnlyMaterial('shadowOnly', scene);
                // this._groundPlane.material = new StandardMaterial("standMat", _scene);
                _groundPlane.receiveShadows = true;

                arComponent.addGroundPlane(_groundPlane);

                let stateMachineComponent: StateMachineComponent = entity.addComponent(new StateMachineComponent()) as StateMachineComponent;
                let stateMachine: StateMachine = stateMachineComponent.stateMachine;

                stateMachine.AddState(DoNothingState.NAME, new DoNothingState(stateMachineComponent, eventDispatcher));
                stateMachine.AddState(IdleState.NAME, new IdleState(stateMachineComponent, eventDispatcher));
                stateMachine.AddState(ExitState.NAME, new ExitState(stateMachineComponent));

                let skeleton: Skeleton = skeletons[0];

                model.skeleton = skeleton;

                let animationComponent: AnimationControllerComponent = entity.addComponent(new AnimationControllerComponent(scene, skeleton)) as AnimationControllerComponent;

                skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
                skeleton.animationPropertiesOverride.enableBlending = true;
                skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
                skeleton.animationPropertiesOverride.loopMode = 1;
                scene.stopAllAnimations();

                let audioComponent: AudioControllerComponent = entity.addComponent(new AudioControllerComponent()) as AudioControllerComponent;

                if (data.videoData && data.videoData.videoURL != "") {
                    let videoComopnent: VideoControllerComponent = entity.addComponent(new VideoControllerComponent(data.videoData, URLHelper.instance().resolveURL(data.modelURL))) as VideoControllerComponent;
                    videoComopnent.root.setParent(root);
                }

                entity.initialize();
                stateMachine.GoToState(DoNothingState.NAME);

                resolve(entity);
                // Once the scene is loaded, just register a render loop to render it
            }, (progress) => {
                // To do: give progress feedback to user
            }, (scene, message) => {
                console.log(message);
            }, ".glb");
        });
    };

}
