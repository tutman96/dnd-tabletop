import React from "react";

import Input, { InputProps } from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';

const InputWithUnit: React.FunctionComponent<InputProps & { unit: string }> = ({ unit, ...props }) => {
  return (
    <Input {...props} endAdornment={<InputAdornment position="end">{unit}</InputAdornment>} />
  )
}
export default InputWithUnit;