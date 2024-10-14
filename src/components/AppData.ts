import { FormErrors, IAppState, IOrderForm, IOrder, IProduct } from '../types';
import { Model } from './base/Model';

export class ProductItem extends Model<IProduct> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
}

export class AppState extends Model<IAppState> {
	catalog: ProductItem[];
	preview: string;
	_basket: ProductItem[] = [];
	order: IOrder = {
		payment: 'card',
		email: '',
		phone: '',
		address: '',
		total: 0,
		items: [],
	};

	formErrors: FormErrors = {};

	addToOrder(item: ProductItem) {
		this.order.items.push(item.id);
	}

	removeFromOrder(item: ProductItem) {
		const index = this.order.items.indexOf(item.id);
		if (index >= 0) {
			this.order.items.splice(index, 1);
		}
	}

	setProductToBasket(item: ProductItem) {
		this._basket.push(item);
	}

	removeProductToBasket(item: ProductItem) {
		const index = this._basket.indexOf(item);
		if (index >= 0) {
			this._basket.splice(index, 1);
		}
	}

	setCatalog(items: IProduct[]) {
		this.catalog = items.map((item) => new ProductItem(item, this.events));
		this.emitChanges('items:changed', { catalog: this.catalog });
	}

	setPreview(item: ProductItem) {
		this.preview = item.id;
		this.emitChanges('preview:changed', item);
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateOrder()) {
			this.events.emit('order:ready', this.order);
		}
	}

	setContactsField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.ValidateContacts()) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrder() {
		const errors: typeof this.formErrors = {};

		if (!this.order.address) {
			errors.address = 'Необходимо указать адресс';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	ValidateContacts() {
		const errors: typeof this.formErrors = {};

		if (!this.order.email) {
			errors.phone = 'Необходимо указать email';
		}
		if (!this.order.phone) {
			errors.email = 'Необходимо указать телефон';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);
		return Object.keys(errors).length === 0;
	}

	get basket(): ProductItem[] {
		return this._basket;
	}

	get statusBasket(): boolean {
		return this._basket.length === 0;
	}

	set total(value: number) {
		this.order.total = value;
	}

	getTotal() {
		return this.order.items.reduce(
			(a, c) => a + this.catalog.find((it) => it.id === c).price,
			0
		);
	}

	clearBasket() {
		this._basket = [];
		this.order.items = [];
	}
}
