import { AppState, ProductItem } from './components/AppData';
import { EventEmitter, IEvents } from './components/base/events';
import { Card, CardBasket, CardPreview } from './components/Card';
import { Basket } from './components/common/Basket';
import { Modal } from './components/common/Modal';
import { Success } from './components/common/Success';
import { LarekApi } from './components/AppApi';
import { Contacts, Order } from './components/Order';
import { Page } from './components/Page';
import './scss/styles.scss';
import { IAppState, IOrderForm, IProduct } from './types';
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';

const events = new EventEmitter();

events.onAll((event) => {
    console.log(event.eventName, event.data)
})

const api = new LarekApi(CDN_URL, API_URL);



//шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog')
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview')
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket')
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket')
const orderTemplate = ensureElement<HTMLTemplateElement>('#order')
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts')
const successTemplate = ensureElement<HTMLTemplateElement>('#success')

//модель данных
const appData = new AppState({}, events)


//глобальные контейнеры
const page = new Page(document.body, events)
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

//переиспользуемые части интерфейса
const basket = new Basket(cloneTemplate<HTMLTemplateElement>(basketTemplate), events);
const order = new Order(cloneTemplate<HTMLFormElement>(orderTemplate), events);
const contacts = new Contacts(cloneTemplate<HTMLFormElement>(contactsTemplate), events)



events.on('items:changed', () => {
    page.catalog = appData.catalog.map((card) => {
        const cardInstant = new Card(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', card)
        });
        return cardInstant.render(card);
    })

});



events.on('card:select', (item: ProductItem) => {
    appData.setPreview(item);
})   


events.on('preview:changed', (item: ProductItem) => {
    const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
        onClick: () => events.emit('card:add', item)
    })
    const content = card.render({
        title: item.title,
        image: item.image,
        text: item.description,
        price: item.price,
        category: item.category
    });
    
    modal.render ({
    content: content
})
});


events.on('card:add', (item: ProductItem) => {
    
    appData.addToOrder(item);
    appData.setProductToBasket(item);
    page.counter = appData.basket.length;
    modal.close();
})



events.on('basket:open', () => {
    basket.setDisabled(basket.button, appData.statusBasket)
    basket.total = appData.getTotal();
    let i = 1;
    basket.items = appData.basket.map((item) => {
        const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('card:remove', item)
        })

        return card.render({
            title: item.title,
            price: item.price,
            index: i++
        })
    })

    modal.render({
        content: basket.render()
    })
})



events.on('card:remove', (item: ProductItem) => {
    appData.removeProductToBasket(item);
    appData.removeFromOrder(item);
    page.counter = appData.basket.length;
    basket.setDisabled(basket.button, appData.statusBasket);
    basket.total = appData.getTotal();
    
    let i = 1;
    basket.items = appData.basket.map((item) => {
        const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('card:remove', item)
        })

        return card.render({
            title: item.title,
            price: item.price,
            index: i++
        })
    })

    modal.render({
        content: basket.render()
    })
})



events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
    const {email, phone, address, payment} = errors;
    order.valid = !address && !payment;
    contacts.valid = !email && !phone;
    order.errors = Object.values({address, payment}).filter(i => !!i).join('; ');
    contacts.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
})


events.on('payment:change', (item: HTMLButtonElement) => {
    appData.order.payment = item.name;
})


events.on(/^order\..*:change/, (data: {field: keyof IOrderForm, value: string}) => {
    appData.setOrderField(data.field, data.value)
});


events.on(/^contacts\..*:change/, (data: {field: keyof IOrderForm, value: string}) => {
    appData.setContactsField(data.field, data.value)
});






events.on('order:open', () => {
    modal.render({
        content: order.render({
            address: '',
            payment: 'card',
            valid: false,
            errors: []
        })
    });
});


events.on('order:submit', () => {
    console.log('предметов в заказе:', appData.order)
    appData.order.total = appData.getTotal()
    modal.render({
        content: contacts.render({
            email: '',
            phone: '',
            valid: false,
            errors: []
        })
    });
})


events.on('contacts:submit', () => {
    console.log('Отправляемые данные:', JSON.stringify(appData.order, null, 2))
    api.orderProducts(appData.order)
    .then((result) => {
        console.log(result)
        const success = new Success(cloneTemplate(successTemplate), {
            onClick: () => {
                modal.close();
                appData.clearBasket();
                page.counter = appData.basket.length;
            }
        });

        modal.render({
            content: success.render({
                total: appData.getTotal()
            })
        })

    })
    .catch(err => {
        console.log(err);
    })
});



events.on('modal:open', () => {
    page.locked = true;
})

events.on('modal:close', () => {
    page.locked = false;
})



api.getProductList()
.then((products) => {appData.setCatalog(products);
})
.catch(err => {
    console.log(err);
});



