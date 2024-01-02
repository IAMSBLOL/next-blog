import React from 'react';

import { getMarkdowns } from '@/src/app/api/blog/_markdown'

const HomePage = async () => {
  const files = await getMarkdowns()
  return (

    <div className='App container m-auto'>

      {
        files
      }
    </div>
  )
};

export default HomePage;
