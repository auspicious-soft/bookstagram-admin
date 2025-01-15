import React from 'react';
import LoginImg  from '@/assets/images/loginImg.png';
import Image from 'next/image';
import BookImg from '@/assets/images/book.png';
const LoginImage = () => {
    return (
        <div>
        <div className="right-image relative">   
         <Image src={LoginImg} alt="animate" width={569} height={858} className="w-full max-h-screen object-contain " /> 
         <div className='absolute top-0 right-0 '>
          <Image src={BookImg} alt="animate" width={216} height={200} className='max-w-[150px] lg:max-w-full  ' />
         </div>
        
        </div>
        </div>
    );
}

export default LoginImage;