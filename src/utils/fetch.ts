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