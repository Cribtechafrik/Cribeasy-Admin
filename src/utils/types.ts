export type HeaderType = {
    "Accept": string;
    "Content-Type": string;
    Authorization: string;
}

export type AuthType = {
    id?: string;
    first_name: string;
    last_name: string;
    role: string;
    profile_image: string;
}

export type Count = {
    count: number
}
export type Amount = {
    amount: number | string;
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
    cloudinary_public?: string;
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
    property_category_id: number;
    property_cover: string;
    property_detail: PropertyDetailsType;
    property_title: string;
    owner: string;
    reviews_count: number;
    user_id: number
    user_name: string;
    user_profile_image: string;
}


export type Property_types_Type = {
    id: number;
    name: string;
}

export type Property_category_Type = {
    id: number;
    name: string;
    slug: string;
}

export type Identity_type_Type = {
    id: number;
    identity_type: string;
}

export type Service_types_Type = {
    id: number;
    name: string;
    slug: string;
}

export type Community_Type = {
    id: number;
    name: string;
}

export type Employment_Status_Type = {
    id: number;
    employment_type: string;
}

export type Plans_Type = {
    id: number;
    amount: string;
    created_at: string;
    currency: string;
    description: string;
    interval: string;
    is_active: number;
    name: string;
    plan_category: string;
    plan_code: string | null;
    slug: string;
    updated_at: string;

}


export type Agent_Landlord_Type = {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    phone_number: string;
    email: string;
    occupation: string | null;
    profile_image: string | null;
    community: string | null;
    is_active: number;
    has_verified_docs: number;
    properties_count: number;
    plan: number | null;
    company_name: string | null,
    company_email: string | null,
    company_phone: string | null,
    company_address: string | null,
    identity_type: string;
    performance_overview: {
        total_properties: number,
        active_properties: number,
        inspection_completed: number,
        property_rating: number,
        property_rating_is_based_on: number
    },
    joined: string;
    updated_at: string;
}


export type ArtisansType = {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    role: string;
    phone_number: string;
    email: string;
    occupation: string | null;
    profile_image: string | null;
    community: string | null;
    is_active: number;
    has_verified_docs: number;
    has_phone_verified: number;
    joined: string;
    reviews: number;
    average_stars: number;
    completed_jobs: number;
    plan: number | null;
    company_name: string | null;
    service_type: string | null;
    proof_of_work: ImageUrl[];
    userServiceFocuses: string[];
    revenue: number;
    years_experience: string;
}


export type RenterType = {
    id: number;
    community: string | null;
    email: string;
    first_name: string;
    full_name: string;
    has_verified_docs: number;
    is_active: number;
    last_name: string;
    occupation: string | null;
    phone_number: string;
    profile_image: string | null;
    role: string;
    plan: number;

    completed_jobs: number;
    employment_status_id: number | null;
    joined: string;
    total_inspections: number;
    updated_at: string;
}

export type InspectionType = {
    id: number;
    agent_first_name: string;
    agent_last_name: string;
    agent_profile_image: string;
    community: string;
    ends_at: string;
    property_address: string;
    property_title: string;
    renter_email: string;
    renter_first_name: string;
    renter_last_name: string;
    starts_at: string;
    status: string;

    agent_phone: string;
    agent_email: string;
    confirmation_code: string | null;
    notes: string;
    property_category: string;
    property_cover: string;
    property_id: number;
    property_price: string;
    property_ref_id: string;
    renter_phone: string;
    renter_profile_image: string;
    cancelled_by: string;
}

export type TicketMessage = {
    id: number;
    message: string;
    sender_id: number;
    sender_name: string;
    sender_image: string;
    sender_type: string;
    attachments: {
        id: number;
        url: string;
        public_id: string;
    }[];
    created_at: string;
}

export type SupportTicketType = {
    id?: number;
    reportID?: string;
    requester_name: string;
    requester_image: string;
    user_type: string;
    subject: string;
    category: string;
    priority: string;
    status: string;

    created_at?: string;
    messages?: TicketMessage[]
}


export type TransactionType = {
    id: number;
    amount: string;
    status: string;
    transaction_type: string;
    transaction_category: string;
    paid_at: string;
    charge: string;
    net_amount: string;
    reference: string;
    user: string;
    user_type: string;
}

export type WithdrawalType = {
    id: number;
    amount: string;
    status: string;
    transaction_type: string;
    transaction_category: string;
    paid_at: string;
    charge: string;
    net_amount: string;
    reference: string;
    user: string;
    user_type: string;
    bank_name: string;
    account_number: number | null;
    account_name: string;
}


export type Subscription_BoostType = {
    id: number;
    amount: string;
    plan_name: string;
    user: string;
    status: string;
    starts_at: string;
    ends_at: string;
    property_name: string;
    duration: string;
}

export type CommunityType = {
    id: number;
    community: string;
    slug: string;
    cloudinary_path: string;
    cloudinary_public: string | null;
    renters: number;
    agents: number;
    artisan: number;
}

export type CommunityDetailType = {
    id: number;
    name: string;
    image: string;
    community: string;
    cloudinary_path: string;
    description: string;
    landmarks: string[];
    members:{
        id: number;
        profile_image: string | null;
    }[];
    count: number;
}

export type LandmarkType = {
    id: number;
    community_id: number;
    name: string;
}


export type CommunityUserType = {
    "id": number;
    "name": string;
    "role": string;
    "joined_community_at": string | null;
}