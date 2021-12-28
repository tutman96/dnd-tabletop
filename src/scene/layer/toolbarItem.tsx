import { Button, ButtonProps } from "sancho";
import React, { useEffect, MouseEvent, ReactNode } from "react";

const SHORTCUT_ICON_MAPPING = {
	'Delete': '\u232B'
} as { [key: string]: string };

type Props = Partial<ButtonProps> & { keyboardShortcuts?: string[], label: string, icon: ReactNode, onClick?: (e: MouseEvent<HTMLButtonElement> | KeyboardEvent) => void };
const ToolbarItem: React.SFC<Props> = ({ label, icon, keyboardShortcuts, ...otherProps }) => {

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
		return () => {}
	}, [keyboardShortcuts, otherProps.onClick])

	return (
		<Button {...otherProps} variant="ghost" iconBefore={icon} size="md">
			{label + (keyboardShortcuts && keyboardShortcuts.length ? ` (${SHORTCUT_ICON_MAPPING[keyboardShortcuts[0]] || keyboardShortcuts[0]})` : '')}
		</Button>
	)
}
export default ToolbarItem;