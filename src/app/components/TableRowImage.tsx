import React, { useState, useEffect } from 'react'
import Image from "next/image";
import { StaticImageData } from 'next/image';


const TableRowImage = ({ image }: { image: string | StaticImageData}) => {
    return (
        <Image
            src={image}
            alt={'alt'}
            unoptimized
            height={23}
            width={23}
            className="w-[23px] h-[23px] object-cover rounded-full"
        />
    );
};

export default TableRowImage