
import { SearchIcon } from '@/utils/svgicons';
import React, { useEffect, useState } from 'react';
interface SearchBarProps {
    setQuery: React.Dispatch<React.SetStateAction<string>>
    query?: string
}

const SearchBar = (props: SearchBarProps) => {
  
    const [inputValue, setInputValue] = useState('');
    const { setQuery,query } = props;
    useEffect(() => {
        const handler = setTimeout(() => {
            setQuery(`${inputValue ? 'description=' :''}${inputValue.trim()}`);
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [inputValue, setQuery]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
    };
    return (
        <div className='w-[248px]'>
            <label htmlFor="" className='relative flex w-full '>
            <input type="search" value={query} onChange={handleInputChange}
             name="" id="" placeholder="Search" className='!h-[40px] placeholder:text-[#6E6E6E] w-full px-5 pl-[40px] focus-visible:outline-none bg-white rounded-[39px] py-2  text-[#6E6E6E] '/>
            <span className='absolute left-[15px] top-[13px] '><SearchIcon /> </span> 
            </label>
        </div>
    );
}

export default SearchBar;
