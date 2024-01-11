'use client'
import React, { useState } from 'react';
import { Modal } from 'antd';

import Seal from './element/seal'

import Digest from './element/digest'

import Info from './element/info'

import Skills from './element/skills'

import styles from './resumeContent.module.scss'

import { useAnimations } from './hooks'

const ResumeContent = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  useAnimations(setIsModalOpen)
  return (
    <div className={styles.resumeContent}>
      <Seal />
      <Digest />

      <Info />

      <Skills />

      <Modal title='系统提示' open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okButtonProps={{ className: ' bg-sky-400' }} okText='联系他' cancelText='正有此意'>
        <p>感觉这个前端挺可怜的,是否拯救他于水深火热之中,安得猛士兮守四方。</p>
        <p>
          无ssl证书不能自动copy联系方式,请见谅。
        </p>
      </Modal>
    </div>
  )
}

export default ResumeContent
