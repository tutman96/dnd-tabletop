import React from "react";

import TextField, { TextFieldProps } from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

const InputWithUnit: React.FunctionComponent<TextFieldProps & { unit: string }> = ({ unit, ...props }) => {
  return (
    <TextField
      variant="outlined"
      size="small"
      {...props}
      InputProps={{
        endAdornment: <InputAdornment position="end">{unit}</InputAdornment>
      }}
    />
  )
}
export default InputWithUnit;