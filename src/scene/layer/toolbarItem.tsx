import React, { useEffect, MouseEvent, ReactNode } from "react";

import Divider from "@mui/material/Divider";
import IconButton, { IconButtonProps } from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import theme from "../../theme";

const SHORTCUT_ICON_MAPPING = {
	'Delete': '\u232B'
} as { [key: string]: string };

type Props = Partial<IconButtonProps> & { keyboardShortcuts?: string[], label: string, icon: ReactNode, onClick?: (e: MouseEvent<HTMLButtonElement> | KeyboardEvent) => void };
const ToolbarItem: React.FunctionComponent<Props> = ({ label, icon, keyboardShortcuts, ...otherProps }) => {

	useEffect(() => {
		if (keyboardShortcuts && otherProps.onClick) {
			const onKeyPress = (e: KeyboardEvent) => {
				if (keyboardShortcuts!.includes(e.key) &&
					window.document.activeElement?.tagName !== 'INPUT') {
					otherProps.onClick!(e);
				}
			}
			window.addEventListener('keyup', onKeyPress);
			return () => window.removeEventListener('keyup', onKeyPress);
		}
		return () => { }
	}, [keyboardShortcuts, otherProps.onClick])

	return (
		<Tooltip title={label + (keyboardShortcuts && keyboardShortcuts.length ? ` (${SHORTCUT_ICON_MAPPING[keyboardShortcuts[0]] || keyboardShortcuts[0]})` : '')}>
			<IconButton
				{...otherProps}
				size="medium"
				sx={{
					height: theme.spacing(5),
					color: theme.palette.grey[200],
					'&.Mui-disabled': {
						color: theme.palette.grey[600]
					}
				}}
			>
				{icon}
			</IconButton>
		</Tooltip>
	)
}
export default ToolbarItem;

export const ToolbarSeparator: React.FunctionComponent = () => {
	return (
		<Divider sx={{height: theme.spacing(5)}} orientation='vertical' />
	)
}