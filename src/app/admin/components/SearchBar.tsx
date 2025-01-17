
import { SearchIcon } from '@/utils/svgicons';
import React, { useState } from 'react';
interface SearchBarProps {
    setQuery?: React.Dispatch<React.SetStateAction<string>>
}

const SearchBar = (props: SearchBarProps) => {
    console.log('props:', props);
  
    const [inputValue, setInputValue] = useState('');
    // const { setQuery } = props;
    // useEffect(() => {
    //     const handler = setTimeout(() => {
    //         setQuery(`${inputValue ? 'description=' :''}${inputValue.trim()}`);
    //     }, 500);

    //     return () => {
    //         clearTimeout(handler);
    //     };
    // }, [inputValue, setQuery]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
    };
    return (
        <div className='w-[248px]'>
            <label htmlFor="" className='relative flex w-full '>
            <input type="search" value={inputValue} onChange={handleInputChange}
             name="" id="" placeholder="Search" className='!h-[40px] placeholder:text-[#6E6E6E] w-full px-5 pl-[40px] focus-visible:outline-none bg-white rounded-[39px] py-2  text-[#6E6E6E] '/>
            <span className='absolute left-[15px] top-[13px] '><SearchIcon /> </span> 
            </label>
        </div>
    );
}

export default SearchBar;
