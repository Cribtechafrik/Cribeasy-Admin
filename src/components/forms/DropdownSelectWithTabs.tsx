import { IoChevronDownSharp } from "react-icons/io5";
import CheckBoxInput from "./CheckBoxInput.tsx";
import { useEffect, useState } from "react";
import { fetchAmenities } from "../../utils/fetch.ts";
import { useAuthContext } from "../../context/AuthContext.tsx";
import type { Amenities_Type } from "../../utils/types.ts";

type SelectedAmenitiesType = {
    amenity: string;
    amenity_icon: string;
}

interface Props {
    selected: SelectedAmenitiesType[];
    setSelected: (s: SelectedAmenitiesType[]) => void;
}

export default function DropdownSelectWithTabs({ selected, setSelected }: Props) {
    const { headers } = useAuthContext();
    const [show, setShow] = useState(false);
    const [propertyAmenitiesData, setPropertyAmenitiesData] = useState<Amenities_Type[] | []>([]);

    const handleSelected = function(title: string) {
        if(selected.some((item) => item.amenity === title)) {
            const modified = selected?.filter(s => s.amenity !== title);
            setSelected(modified);
        } else {
            // setSelected([...selected, title]);
            const amenityIcon = propertyAmenitiesData.find((val) => val.name === title)?.cloudinary_path;
            setSelected([...selected, { amenity: title, amenity_icon: amenityIcon ?? "" }]);
        }
    }

    useEffect(function() {
        (async () => {
            const AmenitiesData = await fetchAmenities(headers)
            if(AmenitiesData?.success) {
                setPropertyAmenitiesData(AmenitiesData?.data[0])
            }
        })();
    }, [])

    return (
        <div className="form--input-box" onClick={() => setShow(!show)}>
            <div className="form--input flex-align-justify-spabtw" style={ show ? { borderColor: "#00419C" } : {}}>
                - Select -{" "}<IoChevronDownSharp />
            </div>

            {show && (
                <span className="input-drop-body">
                    {propertyAmenitiesData && propertyAmenitiesData?.map((val) => (
                        <div className="input-drop-item" key={val?.id} onClick={() => handleSelected(val.name)}>
                            <CheckBoxInput isChecked={selected.some((item) => item.amenity === val.name)} />
                            <p className="flex-align-cen" style={{ gap: "0.68rem" }}>
                                <img src={val?.cloudinary_path} alt={val?.name} />
                                {val?.name}
                            </p>
                        </div>
                    ))}
                </span>
            )}
        </div>
    )
}
