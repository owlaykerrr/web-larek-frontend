import { IProduct } from '../types';
import { CDN_URL } from '../utils/constants';
import { cloneTemplate, ensureElement, isEmpty } from '../utils/utils';
import { Component } from './base/Component';
import { IEvents } from './base/events';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export interface ICard {
	id: string;
	text: string;
	image: string;
	title: string;
	category: string;
	price: number;
}

export class Card<T> extends Component<ICard> {
	events: IEvents;
	itemElement: HTMLElement;
	_title: HTMLElement;
	_category: HTMLElement;
	_image: HTMLImageElement;
	_price: HTMLElement;
	_id: string;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = this.container.querySelector('.card__title');
		this._category = this.container.querySelector(
			'.card__category'
		) as HTMLElement;
		this._image = this.container.querySelector(
			'.card__image'
		) as HTMLImageElement;
		this._price = this.container.querySelector('.card__price') as HTMLElement;

		if (actions?.onClick) {
			container.addEventListener('click', actions.onClick);
		}
	}

	render(cardData: Partial<ICard> | undefined) {
		if (!cardData) return this.container;
		const { ...otherCardData } = cardData;
		return super.render(otherCardData);
	}

	set id(id: string) {
		this._id = id;
	}

	set title(title: string) {
		this._title.textContent = title;
	}

	set category(category: string) {
		if (category === 'другое') {
			this._category.classList.add('card__category_other');
		}
		if (category === 'софт-скил') {
			this._category.classList.add('card__category_soft');
		}
		if (category === 'хард-скил') {
			this._category.classList.add('card__category_hard');
		}
		if (category === 'кнопка') {
			this._category.classList.add('card__category_button');
		}
		if (category === 'дополнительное') {
			this._category.classList.add('card__category_additional');
		}

		this._category.textContent = category;
	}

	set image(image: string) {
		this._image.src = image;
	}

	set price(value: string) {
		if (value === null) {
			this.setText(this._price, `Бесценно`);
		} else {
			this.setText(this._price, `${value} синапсов`);
		}
	}

	get id() {
		return this._id;
	}
}

interface ICardPreview {
	text: string;
}

export class CardPreview extends Card<ICardPreview> {
	protected _text: HTMLElement;
	_button: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container, actions);
		this._button = container.querySelector('.card__button');
		this._text = ensureElement<HTMLElement>('.card__text', container);

		if (actions?.onClick) {
			if (this._button) {
				container.removeEventListener('click', actions.onClick);
				this._button.addEventListener('click', actions.onClick);
			}
		}
	}

	set price(value: string) {
		if (value === null) {
			this.setText(this._price, 'Бесценно');
			this.setText(this._button, `Не для продажи`);
			this._button.setAttribute('disabled', '');
		} else {
			this.setText(this._price, `${value} синапсов`);
		}
	}

	set text(value: string) {
		this.setText(this._text, value);
	}
}

interface ICardBasket {
	title: string;
	price: number;
	index: number;
}

export class CardBasket extends Component<ICardBasket> {
	protected _title: HTMLElement;
	protected _price: HTMLElement;
	protected _button: HTMLElement;
	protected _index: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._index = ensureElement<HTMLElement>('.basket__item-index', container);
		this._button = container.querySelector('.card__button');

		if (actions?.onClick) {
			if (this._button) {
				container.removeEventListener('click', actions.onClick);
				this._button.addEventListener('click', actions.onClick);
			}
		}
	}

	set index(value: number) {
		this.setText(this._index, value);
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set price(value: string) {
		if (value === null) {
			this.setText(this._price, 'Бесценно');
		} else {
			this.setText(this._price, `${value} синапсов`);
		}
	}
}
