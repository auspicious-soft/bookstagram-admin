'use client'
import React, { useState } from 'react';
import BookMarket from './BookMarket';
import BookSchool from './BookSchool';
import BookStudy from './BookStudy';
import BookUniversity from './BookUniversity';
import BookMasters from './BookMasters';

const BookHub = () => {
  const [activeTab, setActiveTab] = useState('Book Market');
  

const renderTabContent = () => {
    switch (activeTab) {
      case "Book Market":
        return <BookMarket/>;
      case "Book School":
        return <BookSchool/>;
      case "Book Study":
        return <BookStudy/>
      case "Book University":
        return <BookUniversity/>;
      case "Book Masters":
        return <BookMasters/>
     default:
        return null;
    }
  }
    return (
        <div>
            <div className="tabs flex flex-wrap justify-between gap-[5px] bg-darkBlack p-2 rounded-[47px] mb-10 ">
            {["Book Market", "Book School", "Book Study", "Book University", "Book Masters"].map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeTab === tab ? 'active text-orange bg-white ' : 'text-white   '} rounded-[34px] px-[16px] py-[10px] w-[calc(20%-5px)] `}
                onClick={() => setActiveTab(tab)}
              >{tab}</button>
            ))}
          </div>
          <div className="tab-content">
          {renderTabContent()}
        </div>
        </div>
    );
}

export default BookHub;
