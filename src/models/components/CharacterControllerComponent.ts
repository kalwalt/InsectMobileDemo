import { EntityComponent } from "app/framework/entity/EntityComponent";
import { CharacterData } from "../AppData";

export class CharacterControllerComponent extends EntityComponent{
    
    static NAME : string = "InsectControllerComponent";

    public data : CharacterData;

    constructor( data : CharacterData){
        super(CharacterControllerComponent.NAME);
        this.data = data;
    }
}