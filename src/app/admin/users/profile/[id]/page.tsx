import UserProfile from '@/app/admin/components/UserProfile';
import React from 'react';


const Page = async({ params }) => {
    const { id } = params;
    return (
       <div>
        <UserProfile id={id}/>
       </div>
    );
}

export default Page;
