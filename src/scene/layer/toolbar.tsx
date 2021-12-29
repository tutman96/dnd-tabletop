import React from "react";

import Box from '@mui/material/Box';

import theme from '../../theme';

const Toolbar: React.FunctionComponent = ({ children }) => {
	return (
		<Box
			sx={{
				position: 'relative',
				top: 0, left: 0, right: 0,
				minHeight: theme.spacing(5),
				backgroundColor: theme.palette.grey[800],
				boxShadow: theme.shadows[5],
				paddingX: theme.spacing(1),
				zIndex: theme.zIndex.appBar,
				'> span': {
					display: 'flex'
				}
			}}
		>
			{children}
		</Box>
	);
}
export default Toolbar;