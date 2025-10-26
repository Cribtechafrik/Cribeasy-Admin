import CheckBoxInput from '../forms/CheckBoxInput'

export default function WorkingHour({ isChecked=false, day }: {
    isChecked?: boolean; day: string; handleClick?: (day: string) => void;
}) {
    return (
        // <div className="form--check flex-col-0-8 pointer" onClick={() => handleClick(day)}>
        <div className="form--check flex-col-0-8 pointer">
            <p className="form--info colored">{day}</p>
            <CheckBoxInput isChecked={isChecked ?? false} />
        </div>
    )
}
