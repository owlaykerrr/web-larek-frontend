import { createElement, ensureAllElements, ensureElement, formatNumber } from "../../utils/utils";
import { Component } from "../base/Component";
import { EventEmitter } from "../base/events";


interface IBasketView {
    items: HTMLElement[];
    total: number;
}


export class Basket extends Component<IBasketView> {
    protected _list: HTMLElement;
    protected _total: HTMLElement;
    button: HTMLElement;

    constructor(container: HTMLElement, protected events: EventEmitter) {
        super(container);

        this._list = ensureElement<HTMLElement>('.basket__list', container);
        this._total = this.container.querySelector('.basket__price');
        this.button = this.container.querySelector('.basket__button');

        if(this.button) {
             this.button.addEventListener('click', () => {
                 events.emit('order:open'); 
        })
    }

        this.items = [];     
}

set items(items: HTMLElement[]){
    if(items.length) {
        this._list.replaceChildren(...items);
    } else {
        this._list.replaceChildren(createElement<HTMLParagraphElement>('p', {
            textContent: 'Корзина пуста'
        }
        ))
    }
}



set total(total: number) {
    this.setText(this._total, formatNumber(total));
}



}