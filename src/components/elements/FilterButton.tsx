import { IoOptionsOutline } from 'react-icons/io5';

interface Props {
    handleShowFilter: () => void;
}


export default function FilterButton({ handleShowFilter }: Props) {
  return (
    <button className='page--filter-btn' onClick={handleShowFilter}>
      <IoOptionsOutline /> Filter
    </button>
  )
}
