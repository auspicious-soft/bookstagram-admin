import React, { useState } from 'react';
import Modal from '@mui/material/Modal';
import CourseCard from './CourseCard';
import imgg from '@/assets/images/book.png'
import { PlusIcon } from '@/utils/svgicons'; 
import CouponCode from './CouponCode';

interface ModalProp {
    open: any;
    onClose: any;
}
const courses = [
    { id: 1, title: "Learn Figma from Scratch", image: imgg },
    { id: 2, title: "Advanced Photoshop", image: imgg },
    { id: 3, title: "Web Development Basics", image: imgg },
  ];
const GenerateCouponModal:React.FC<ModalProp> = ({open, onClose }) => {
    const[couponModal, setCouponModal] = useState(false);
    const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
    const handleSelect = (id: number) => {
        setSelectedCourses((prev) =>
          prev.includes(id) ? prev.filter((courseId) => courseId !== id) : [...prev, id]
        );
      };
    return (
        <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="child-modal-title" 
        className='grid place-items-center '
      >
       <div className='modal bg-white py-[30px] px-5 max-w-[950px] mx-auto rounded-[20px] w-full h-full '>
        <div className='max-h-[80vh] overflow-auto overflo-custom'>
        <h2 className='text-[32px] text-darkBlack mb-5  '>Generate A Coupon Code</h2>
        <div className='main-form '>
       <div className='grid grid-cols-[2fr_1fr] gap-5 mb-5'>
       <label>Name of school
            <input type="text" placeholder='Enter school Name' required/>
        </label>
        <label>Number of activations allowed
            <input type="number" placeholder='100' required/>
        </label>
       </div>
       <h2 className='text-[32px] text-darkBlack mb-5  '>Select Publishers</h2>
       <label>Search
        <input type="search" placeholder='Enter Name of the course' />
        </label>
        <div className='mt-5 pt-5 grid grid-cols-4 gap-5 border-t border-dashed border-[#D0D0D0] '>
        {courses.map((course) => (
        <CourseCard
          key={course.id}
          title={course.title}
          image={course.image}
          selected={selectedCourses.includes(course.id)}
          onSelect={() => handleSelect(course.id)}
        />
      ))}
        </div>
        <div className='mt-[30px] flex gap-2.5 justify-end   '>
            <button onClick={()=>setCouponModal(true)} className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] ">
            <PlusIcon /> Generate A Coupon
            </button>
           <button onClick={onClose} className='rounded-[28px] border border-darkBlack py-2 px-5 text-sm '>Cancel</button>
        </div>

        </div>
           
        </div>
      <CouponCode open={couponModal} onClose={()=>setCouponModal(false)}/>
       {/* <CouponModal open={couponModal} onClose={()=>setCouponModal(false)} /> */}
       </div>
      </Modal>
    );
}

export default GenerateCouponModal; 

