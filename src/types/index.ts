

export interface IProduct { 
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
}


export interface IAppState {
    catalog: IProduct[];
    preview: string;
    basket: string[];
    order: IOrder;
    total: string | number;
    loading: boolean;
}




export interface IOrderForm {
    address: string;
    email: string;
    phone: string;
    total: string | number;
    payment?: string;
}



export interface IOrder extends IOrderForm {
    items: string[];
}

export interface IOrderResult {
    id: string;
}


export type FormErrors = Partial<Record <keyof IOrder, string>>