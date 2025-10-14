import React, { useEffect, useState } from 'react'
import { useAuthContext } from '../../../context/AuthContext';
import type { ListingType } from '../../../utils/types';
import { toast } from 'sonner';
import { SpinnerMini } from '../../../components/elements/Spinner';
// 
export default function ListingDetails({ id }: { id: number }) {
    const { headers, shouldKick } = useAuthContext();
    const [loading, setLoading] = useState(false)
    const [listingData, setListingData] = useState<ListingType | null>(null);


    async function handleFetchListing() {
        setLoading(true);

        try {
			const res = await fetch(`${import.meta.env.VITE_BASE_URL}/v1/admin/properties/${id}?full=true`, {
				method: "GET",
				headers,
			});
            shouldKick(res);

			const data = await res.json();
            console.log(data)
			if (res.status !== 200 || !data?.success) {
                throw new Error(data?.error?.message);
            }

            setListingData(data?.data);
		} catch (err: any) {
			const message = err?.message == "Failed to fetch" ? "Check Internet Connection!" : err?.message;
			toast.error(message);
		} finally {
			setLoading(false);
		}
    }

    useEffect(function() {
        handleFetchListing();
    }, [id]);


  return (
    <React.Fragment>
        {loading && (
            <div className="table-spinner-container">
                <SpinnerMini />
            </div>
        )}


        {(!loading && listingData) && (
            <div>
                <img src={listingData?.property_cover} alt={listingData?.property_title} />

                
            </div>
        )}
    </React.Fragment>
  )
}



// average_stars: 3.3
// cloudinary_id: null
// description: "Spacious and affordable"
// favorited_by_me: false
// gallery: {id: 8, property_id: 8, images_url: [
//     {
//         cloudinary_id: null
//         cloudinary_url: "https://res.cloudinary.com/duc4qxywq/image/upload/
//     }
// ]}
// id: 8
// is_active: 1
// is_boosted: 0
// owner: "Agent"
// property_category: "Duplex"
// property_cover: "https://res.cloudinary.com/duc4qxywq/image/upload/v1751627076/apart1_igfnqg.png"
// property_detail: {
//     amenities: (3) [
//         {
//             amenity: "24/7 security"
//             amenity_icon: "https://res.cloudinary.com/duc4qxywq/image/upload/v1752832386/Security_qsgnxf.svg"
//         }
//     ]
//     available_from: "2025-07-18 17:11:36"
//     bathrooms: 3
//     bedrooms: 3
//     custom_fields: [
//         {
//             field_title: "gym"
//             field_value: "we good"
//         }
//     ]
//     id: 8
//     property_address: "Ajah, Lagos"
//     property_id: 8
//     property_size: "230 sqm"
//     property_type: "Furnished"
//     property_type_id: 1
//     rent_price: "2500000.00"
//     security_deposit: "400000.00"
//     service_charge: "120000.00"
//     toilets: 4
// }
// property_ref_id: "PROP008"
// property_title: "Detached Duplex Ajah"
// reviews_count: 10
// user_id: 1
// user_name: "Ayomide Alase"
// user_profile_image