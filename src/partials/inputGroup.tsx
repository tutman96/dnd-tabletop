import React from "react";

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import theme from "../theme";

const InputGroup: React.FunctionComponent<React.PropsWithChildren<{ header: string; }>> = ({ header, children }) => {
  return (
    <>
      <Typography variant="overline" color={theme.palette.grey[300]}>{header}</Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: theme.spacing(1),
        }}
      >
        {children}
      </Box>
    </>
  );
};
export default InputGroup;