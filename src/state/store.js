import { buildCharacters } from '../main';

export class Store {

    _chars = [];

    _selected = null;

    constructor() {}

    set chars( value ) {
        this._chars = value;
    }

    get chars() {
        return this._chars;
    }

    set selected( id ) {
        this._selected = this.chars.find(( item ) => String(item.id) === String(id) );
    }

    get selected() {
        return this._selected;
    }

    setCollection( collection ) {
        this.chars = collection;
        buildCharacters( collection );
    }
}
