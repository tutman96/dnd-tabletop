export function getScreenPPI(): number {
	// const el = document.createElement('div');
	// el.setAttribute('style', 'width: 1in;');
	// document.body.appendChild(el);
	// const dpi = el.offsetWidth;
	// document.body.removeChild(el);
	// return dpi;
	return 109.47;
}

export function calculatePPIScale(imagePPI: number): number {
	const screenPPI = getScreenPPI();
	return screenPPI / imagePPI;
}

export function inchToPx(inches: number): number {
	return inches * getScreenPPI();
}