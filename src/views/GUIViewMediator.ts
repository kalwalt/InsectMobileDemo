import { DataEvent } from "app/controllers/DataEvent";
import { Mediator } from "app/framework/Mediator";
import { isMobile } from "app/framework/utils/Utils";
import { GameEvents } from "app/models/AppData";

export class GUIViewMediator extends Mediator {

    private _GUI: HTMLElement;

    private homeURL: string;

    constructor(dispatcher: EventTarget, home: string) {
        super(dispatcher);
        this.homeURL = home;
        this._GUI = document.getElementById('app');
    }

    public hideLoading(): void {
        let loadingTextField: HTMLParagraphElement = document.getElementById("loadingTextfield") as HTMLParagraphElement;
        loadingTextField.style.display = "none";
        let button: HTMLButtonElement = document.getElementById("homeButton") as HTMLButtonElement;
        button.style.display = "";

        this.orientationCheck();
    }

    public displayDirections(value: boolean): void {
        document.getElementById("textTest").style.display = value ? "" : "none";
    }

    public orientationCheck(): void {

        if (!isMobile()) {
            document.getElementById("infoText").style.display = "none";
        }
        else {
            if (window.innerHeight > window.innerWidth) {
                console.log("in portrait mode");
                document.getElementById("infoText").style.display = "";
            }
            else {
                console.log("in landscape mode");
                document.getElementById("infoText").style.display = "none";
            }
        }
    }

    public displayError(error: string): void {
        document.getElementById("textTest").style.display = "none";
        document.getElementById("loadingTextfield").style.display = "none";

        document.getElementById("homeButton").style.display = "";
        document.getElementById("infoText").style.display = "";
        document.getElementById("infoText").textContent = error;
    };

    public initialize(): void {

        let button: HTMLButtonElement = document.getElementById("homeButton") as HTMLButtonElement;
        let textField: HTMLParagraphElement = document.getElementById("textTest") as HTMLParagraphElement;

        textField.textContent = "Point the camera at the Insecta AR card";

        document.getElementById("videoButton").style.display = "none";
        document.getElementById("videoButton").addEventListener("click", this.handlePlayVideo.bind(this));
        button.style.display = "none";
        button.addEventListener("click", (eve) => {
            eve.preventDefault();

            location.href = this.homeURL;
        })

        this.contextDispatcher.addEventListener(GameEvents.DISPLAY_INFO_BUTTON, (eve: DataEvent) => {
            this.displayDirections(eve.data);
        })


        this.contextDispatcher.addEventListener(GameEvents.DISPLAY_VIDEO_BUTTON, this.handleDisplayVideoButton.bind(this));
        textField.style.display = "none";

        this.orientationCheck();
        window.addEventListener("orientationchange", (event) => {
            console.log("the orientation of the device is now ");
            this.orientationCheck();
        });
    }

    private handlePlayVideo(event: Event): void {
        this.contextDispatcher.dispatchEvent(new Event(GameEvents.PLAY_VIDEO_EVENT));
    }

    private handleDisplayVideoButton(event: DataEvent): void {
        let visible: boolean = event.data.visible;
        document.getElementById("videoButton").style.display = visible ? "" : "none";
    }
    
    public displayPlayButton( value : boolean ):void{
        document.getElementById("videoButton").style.display = value ? "" : "none";
    }
}