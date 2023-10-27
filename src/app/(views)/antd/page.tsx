import React from 'react';
import { Button } from 'antd';
import { getMarkdowns } from '@/app/api/blog/_markdown'

const HomePage = async () => {
  const files = await getMarkdowns()
  return (

    <div className="App">
      <Button
        type="primary">Button</Button>
      {
        files
      }
    </div>
  )
};

export default HomePage;
