import { PlusIcon } from '@/utils/svgicons';
import React from 'react';

interface ButtonProps {
    text: string;
    onClick: React.MouseEventHandler<HTMLButtonElement>;
}
const Button:React.FC<ButtonProps> = ({text, onClick}) => {
    return (
       <button onClick={onClick}
        className="flex items-center gap-2.5 bg-orange text-white text-sm px-5 py-2.5 text-center rounded-[28px] ">
        <PlusIcon /> {text}
        </button>
    );
}

export default Button;
