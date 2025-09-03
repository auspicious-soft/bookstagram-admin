import { SelectSvg } from "@/utils/svgicons";
import Image, { StaticImageData } from "next/image";
import React from "react";

interface CourseCardProps {
  title: string;
  image: string | StaticImageData; 
  selected?: boolean;
  onSelect: () => void; 
}

const CourseCard: React.FC<CourseCardProps> = ({ title, image, selected, onSelect }) => {
  return (
    <div className="relative cursor-pointer"
      onClick={onSelect} >
      <Image
        src={image}
        unoptimized
            width={264}
            height={170}
            alt="image"
            className="rounded-[10px] aspect-[3/3] object-cover w-full"
      />
      <div className="absolute top-2 right-2  ">
        {selected ? <SelectSvg color="var(--tw-bg-orange)" /> : <SelectSvg color="#DADADA"/>}
      </div>
      <p className="mt-[7px] text-sm text-darkBlack leading-[normal] ">
        {title}
      </p>
    </div>
  );
};

export default CourseCard;
