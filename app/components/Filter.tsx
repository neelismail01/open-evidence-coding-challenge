'use client';

import React from 'react';
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';

interface FilterProps {
  options: string[];
  selectedFilter: string;
  onFilterChange: (filter: string) => void;
  label: string;
}

const Filter: React.FC<FilterProps> = ({ options, selectedFilter, onFilterChange, label }) => {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onFilterChange(event.target.value);
  };

  return (
    <FormControl sx={{ m: 1, minWidth: 120 }}>
      <InputLabel id={`${label}-select-label`}>{label}</InputLabel>
      <Select
        labelId={`${label}-select-label`}
        id={`${label}-select`}
        value={selectedFilter}
        label={label}
        onChange={handleChange}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 200,
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default Filter;
