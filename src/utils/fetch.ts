import type { HeaderType } from "./types";

const BASE_URL = import.meta.env.VITE_BASE_URL

export async function fetchPropertyTypes({ headers }: { headers: HeaderType }) {
    try {
        const res = await fetch(`${BASE_URL}/v1/property-type`, {
            method: "GET",
            headers,
        });

        const data = await res.json();
        console.log(data)
        if (res.status !== 200 || !data?.success) {
            throw new Error(data?.error?.message);
        }

        return data

    } catch(err) {
        throw err
    }
}


export async function fetchAmenities({ headers }: { headers: HeaderType }) {
    try {
        const res = await fetch(`${BASE_URL}/v1/amenities`, {
            method: "GET",
            headers,
        });

        const data = await res.json();
        console.log(data)
        if (res.status !== 200 || !data?.success) {
            throw new Error(data?.error?.message);
        }

        return data

    } catch(err) {
        throw err
    }
}

export async function fetchPropertyCategories({ headers }: { headers: HeaderType }) {
    try {
        const res = await fetch(`${BASE_URL}/v1/property-category`, {
            method: "GET",
            headers,
        });

        const data = await res.json();
        console.log(data)
        if (res.status !== 200 || !data?.success) {
            throw new Error(data?.error?.message);
        }

        return data

    } catch(err) {
        throw err
    }
}

export async function fetchIdentityTypes({ headers }: { headers: HeaderType }) {
    try {
        const res = await fetch(`${BASE_URL}/v1/identity-type`, {
            method: "GET",
            headers,
        });

        const data = await res.json();
        console.log(data)
        if (res.status !== 200 || !data?.success) {
            throw new Error(data?.error?.message);
        }

        return data

    } catch(err) {
        throw err
    }
}

export async function fetchEmploymentStatuses({ headers }: { headers: HeaderType }) {
    try {
        const res = await fetch(`${BASE_URL}/v1/employment-status`, {
            method: "GET",
            headers,
        });

        const data = await res.json();
        console.log(data)
        if (res.status !== 200 || !data?.success) {
            throw new Error(data?.error?.message);
        }

        return data

    } catch(err) {
        throw err
    }
}


export async function fetchServiceTypes({ headers }: { headers: HeaderType }) {
    try {
        const res = await fetch(`${BASE_URL}/v1/service-types`, {
            method: "GET",
            headers,
        });

        const data = await res.json();
        console.log(data)
        if (res.status !== 200 || !data?.success) {
            throw new Error(data?.error?.message);
        }

        return data

    } catch(err) {
        throw err
    }
}


export async function fetchCommunities({ headers }: { headers: HeaderType }) {
    try {
        const res = await fetch(`${BASE_URL}/v1/communities`, {
            method: "GET",
            headers,
        });

        const data = await res.json();
        console.log(data)
        if (res.status !== 200 || !data?.success) {
            throw new Error(data?.error?.message);
        }

        return data

    } catch(err) {
        throw err
    }
}

export async function fetchPlans({ headers }: { headers: HeaderType }) {
    try {
        const res = await fetch(`${BASE_URL}/v1/general-plans`, {
            method: "GET",
            headers,
        });

        const data = await res.json();
        console.log(data)
        if (res.status !== 200 || !data?.success) {
            throw new Error(data?.error?.message);
        }

        return data

    } catch(err) {
        throw err
    }
}