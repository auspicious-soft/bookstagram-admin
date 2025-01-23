import React, { useState } from 'react';  
import book from '@/assets/images/bookCard.png';
import { DropWhite, PlusIcon } from '@/utils/svgicons';
import BookCard from '../BookCard';
import SearchBar from '../SearchBar';
const BookMarket = () => {
 const [activeTab, setActiveTab] = useState('All');
const [showData, setShowData] = useState(false);


 const renderTabContent = () => {
    switch (activeTab) {
      case "All":
        return <div className='grid grid-cols-4 gap-6'><BookCard title="Name of the book" price='100' imgSrc={book} author='Mukhtar Auezov' /></div>;
      case "e-Books":
        return <div>hgfdg </div>;
     default:
        return null;
    }
  }

    return (
        <div>

        <div className='flex justify-between mb-5'>
            <div className="tabs flex flex-wrap gap-[5px] ">
            {["All", "e-Books", "Audiobooks", "Courses", "Podcasts"].map((tab) => (
                <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active text-white bg-darkBlack ' : 'text-darkBlack bg-white   '} rounded-[34px] text-sm px-5 py-[10px]  `}
                onClick={() => setActiveTab(tab)}
                >{tab}</button>
            ))}
          </div>
          <div className='flex justify-end items-center gap-2.5'>
            {/* <SearchBar/> */}
            <div className='relative'>
            <button onClick={() => setShowData(!showData)}
            className='flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] '>
            <PlusIcon/> Add <span>|</span> <DropWhite/></button>
            {showData && (
           <div className="space-y-2 absolute z-[2] top-[45px] right-0 w-full h-auto bg-white p-4 rounded-lg shadow-lg [&_*]:!text-darkBlack [&_*]:!w-full [&_*]:!text-left">
            <button onClick={()=>console.log("Hellooo")}>e-Books</button>
            <button>Audiobooks</button>
            <button>Courses</button>
            <button>Podcasts</button>
          </div>
          )}
            </div>
          </div>
        </div>
          <div className="tab-content">
          {renderTabContent()}
        </div>
        </div>
    );
}

export default BookMarket;
