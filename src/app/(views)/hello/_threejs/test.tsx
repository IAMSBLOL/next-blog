'use client'
import React from 'react';
import { Mentions } from 'antd';
import type { MentionsOptionProps } from 'antd/es/mentions';

const HomePage = () => {
  const onChange = (value: string) => {
    console.log('Change:', value);
  };

  const onSelect = (option: MentionsOptionProps) => {
    console.log('select', option);
  };
  return (

    <div className="App">

      <Mentions
        style={{ width: '100%' }}
        onChange={onChange}
        onSelect={onSelect}
        defaultValue="@afc163"
        options={[
          {
            value: 'afc163',
            label: 'afc163',
          },
          {
            value: 'zombieJ',
            label: 'zombieJ',
          },
          {
            value: 'yesmeck',
            label: 'yesmeck',
          },
        ]}
      />
    </div>
  )
};

export default HomePage;
