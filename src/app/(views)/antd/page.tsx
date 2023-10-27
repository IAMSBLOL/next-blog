import React from 'react';
import { Button } from 'antd';
import { getMarkdowns } from '@/src/app/api/blog/_markdown'

const HomePage = async () => {
  const files = await getMarkdowns()
  return (

    <div className="App container m-auto">
      <Button
        type="primary">Button</Button>
      {
        files
      }
    </div>
  )
};

export default HomePage;
