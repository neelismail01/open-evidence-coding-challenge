export interface campaign_category {
    id: number;
    created_at: string;
    campaign_id: campaign;
    advertising_category: advertising_category;
    active: boolean;
    bid: number;
}

export interface campaign {
    id: number;
    created_at: string;
    treatment_name: string;
    description: string;
    company_id: company;
    active: boolean;
    product_url: string;
}

export interface company {
    id: number;
    created_at: string;
    name: string;
}

export interface click {
    id: number;
    created_at: string;
    campaign_category: campaign_category;
    bid: number;
}

export interface impression {
    id: number;
    created_at: string;
    campaign_category: campaign_category;
    bid: number;
}

export interface advertising_category {
    id: number;
    created_at: string;
    keyword: string;
    keyword_embedding: any[]
}