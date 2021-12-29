import React, { useEffect, MouseEvent, ReactNode } from "react";

import Button, { ButtonProps } from "@mui/material/Button";
import theme from "../../theme";

const SHORTCUT_ICON_MAPPING = {
	'Delete': '\u232B'
} as { [key: string]: string };

type Props = Partial<ButtonProps> & { keyboardShortcuts?: string[], label: string, icon: ReactNode, onClick?: (e: MouseEvent<HTMLButtonElement> | KeyboardEvent) => void };
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
		<Button {...otherProps} startIcon={icon} size="large"
			sx={{
				height: theme.spacing(5),
				color: theme.palette.grey[200],
				'&.Mui-disabled': {
					color: theme.palette.grey[600]
				}
			}}
		>
			{label + (keyboardShortcuts && keyboardShortcuts.length ? ` (${SHORTCUT_ICON_MAPPING[keyboardShortcuts[0]] || keyboardShortcuts[0]})` : '')}
		</Button>
	)
}
export default ToolbarItem;