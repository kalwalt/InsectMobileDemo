export class Context {

    protected _name: string;

    protected _eventDispatcher: EventTarget = new EventTarget();

    public get eventDispatcher(): EventTarget {
        return this._eventDispatcher;
    }

}