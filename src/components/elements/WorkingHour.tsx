import CheckBoxInput from '../forms/CheckBoxInput'

export default function WorkingHour({ isChecked=false, day, handleClick }: {
    isChecked?: boolean; day: string; handleClick: () => void;
}) {
    return (
        // <div className="form--check flex-col-0-8 pointer">
        <div className="form--check flex-col-0-8 pointer" onClick={handleClick}>
            <p className="form--info colored">{day}</p>
            <CheckBoxInput isChecked={isChecked ?? false} />
        </div>
    )
}
