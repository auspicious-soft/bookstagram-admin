'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const ProgressBar = dynamic(() => import('next-nprogress-bar').then((mod) => mod.AppProgressBar),
  { ssr: false }
)

const Providers = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <>
      {children}
      {mounted && (
        <ProgressBar
          height="4px"
          color="#F96915"
          options={{ showSpinner: false }}
          shallowRouting
        />
      )}
    </>
  );
};

export default Providers;