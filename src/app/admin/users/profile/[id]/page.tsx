import UserProfile from '@/app/admin/components/UserProfile';
import React from 'react';

interface Props {
    params: {
      id: string; 
    };
  }

const Page = async({ params }: Props) => {
    const { id } = params;
    return (
       <div>
        <UserProfile id={id}/>
       </div>
    );
}

export default Page;
