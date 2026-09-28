export interface ProductsDataResponse {
results: number;
metadata: Metadata;
data: ProductData[];
}

export interface Metadata {
currentPage: number;
numberOfPages: number;
limit: number;
nextPage?: number;
}

export interface ProductData {
_id: string;
id: string;

title: string;
slug: string;
description: string;

quantity: number;
sold: number;

price: number;
priceAfterDiscount?: number;

imageCover: string;
images: string[];

ratingsQuantity: number;
ratingsAverage: number;

category: Category;
subcategory: Subcategory[];
brand: Brand;

availableColors?: string[];

createdAt: string;
updatedAt: string;
}

export interface Category {
_id: string;
name: string;
slug: string;
image: string;
}

export interface Subcategory {
_id: string;
name: string;
slug: string;
category: string;
}

export interface Brand {
_id: string;
name: string;
slug: string;
image: string;
}

