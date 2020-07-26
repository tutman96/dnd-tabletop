import React from "react";
import { css } from "emotion";
import { useTheme } from "sancho";

const Toolbar: React.SFC = ({ children }) => {
	const theme = useTheme();
	return (
		<div
			className={css`
				position: relative;
				top: 0; left: 0; right: 0;
				min-height: 40px;
				background-color: ${theme.colors.background.tint1};
				box-shadow: ${theme.shadows.md};
				z-index: 100;
				> span {
					display: flex;
				}
			`}
		>
			{children}
		</div>
	);
}
export default Toolbar;