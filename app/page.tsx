'use client';

import React, { useState } from 'react';
import { SelectChangeEvent } from '@mui/material';

import AdvertiserHome from './advertiser/page';
import PhysicianHome from './physician/page';
import { ADVERTISER_MODE, PHYSICIAN_MODE } from './constants';

export default function Home() {
  const [mode, setMode] = useState<string>(PHYSICIAN_MODE)

  const handleModeChange = (event: SelectChangeEvent) => {
    setMode(event.target.value as string);
  }

  if (mode == ADVERTISER_MODE) {
    return (
      <AdvertiserHome
        mode={mode}
        handleModeChange={handleModeChange}
      />
    );
  }

  return (
    <PhysicianHome
      mode={mode}
      handleModeChange={handleModeChange}
    />
  )
}