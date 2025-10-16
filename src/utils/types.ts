export type HeaderType = {
    "Accept": string;
    "Content-Type": string;
    Authorization: string;
}

export type AuthType = {
    first_name: string;
    last_name: string;
    role: string;
    profile_image: string;
}

export type Count = {
    count: number
}

export type Amenities_Type = {
    id: number;
    name: string;
    cloudinary_path: string;
}


type PropertyDetailsType = {
    id: number;
    property_address: string;
    rent_price: string;
    amenities: {
        amenity: string;
        amenity_icon: string;
    }[]
    available_from: string;
    bathrooms: number;
    bedrooms: number;
    custom_fields:{
        field_title: string;
        field_value: string;
    }[];
    property_id: number;
    property_size: string;
    property_type: string;
    property_type_id: number;
    security_deposit: string;
    service_charge: string;
    toilets: number;
}

export type ImageUrl = {
    cloudinary_id: string | null;
    cloudinary_url: string;
}

export type ListingType = {
    average_stars: number;
    cloudinary_id: null
    description: string;
    date_added: string;
    favorited_by_me: boolean;
    id: number;
    gallery: {
        id: number;
        propery_id: number;
        images_url: ImageUrl[]
    }
    property_ref_id: string;
    is_active: number;
    is_boosted: number;
    is_booked?: number;
    property_category: string;
    property_cover: string;
    property_detail: PropertyDetailsType;
    property_title: string;
    owner: string;
    reviews_count: number;
    user_id: number
    user_name: string;
    user_profile_image: string;
}


export type Property_type = {
    id: number;
    name: string;
}


export type Agent_Landlord_Type = {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    phone_number: string;
    email: string;
    occupation: any;
    profile_image: any;
    community: any;
    is_active: number;
    has_verified_docs: number;
    properties_count: number;
    plan: any;
}