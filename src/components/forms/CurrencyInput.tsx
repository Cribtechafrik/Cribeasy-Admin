
interface Props {
    placeholder: string;
    name: string;
    id: string;
    value: string;
    onChange: (v: string) => void;
}


export default function CurrencyInput({ placeholder, name, id, value, onChange }: Props) {
    const handleChange = function(value: string) {
      const formattedValue = value.replace(/[^0-9]/g, '').replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      onChange(formattedValue);
    }

  return (
    <div className="form--input-currency flex-align-cen">
        <span className="form--currency-box">₦</span>
        <input type="text" className="form--input" name={name} id={id} placeholder={placeholder} value={value} onChange={(e) => handleChange(e.target.value)} />
    </div>
  )
}
