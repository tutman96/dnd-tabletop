import { Tooltip, Input, InputBaseProps } from "sancho";
import React from "react";
import { css } from "emotion";

type Props = InputBaseProps & { label: string };
const ToolbarSlider: React.SFC<Props> = ({ ...otherProps }) => {
	return (
		<Tooltip content={otherProps.label} placement="bottom">
			<Input
				{...otherProps}
				type='range'
				className={`${otherProps.className} ` + css`
					max-width: 100px !important;
				`}
			/>
		</Tooltip>
	)
}
export default ToolbarSlider;