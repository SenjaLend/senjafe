"use client";

import React, { memo } from 'react';
import { PoolsOverview } from './pools-overview';

const PoolsTable = memo(function PoolsTable() {
  return <PoolsOverview />;
});

PoolsTable.displayName = 'PoolsTable';

export default PoolsTable;