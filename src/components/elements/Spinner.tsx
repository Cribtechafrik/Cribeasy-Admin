
import { Ring2 } from 'ldrs/react'
import 'ldrs/react/Ring2.css'

export default function Spinner() {
    return (
        <div className="spinner--container">
            <Ring2
                size="40"
                stroke="5"
                strokeLength="0.25"
                bgOpacity="0.1"
                speed="0.8"
                color="#00419C" 
            />
        </div>
    )
}

export function SpinnerMini({ size, color, stroke }: { size?: number; color?: string, stroke?: number }) {
    return (
        <div className="flex-align-justify-center">
            <Ring2
                size={size || "30"}
                stroke={stroke || "5"}
                strokeLength="0.25"
                bgOpacity="0.1"
                speed="0.8"
                color={color || "#00419C"} 
            />
        </div>
    )
}