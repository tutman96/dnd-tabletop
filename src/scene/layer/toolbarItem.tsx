import { IconButtonProps, IconButton, Tooltip } from "sancho";
import React, { useEffect, MouseEvent } from "react";

type Props = IconButtonProps & { keyboardShortcuts?: string[], onClick?: (e: MouseEvent<HTMLButtonElement> | KeyboardEvent) => void };
const ToolbarItem: React.SFC<Props> = ({ label, keyboardShortcuts, ...otherProps }) => {

	useEffect(() => {
		if (keyboardShortcuts && otherProps.onClick) {
			const onKeyPress = (e: KeyboardEvent) => {
				if (keyboardShortcuts!.includes(e.key)) otherProps.onClick!(e);
			}
			window.addEventListener('keyup', onKeyPress);
			return () => window.removeEventListener('keyup', onKeyPress);
		}
	}, [keyboardShortcuts, otherProps.onClick])

	return (
		<Tooltip content={label} placement="bottom">
			<IconButton
				variant="ghost"
				label={label}
				{...otherProps}
			/>
		</Tooltip>
	)
}
export default ToolbarItem;