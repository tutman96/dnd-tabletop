export function getImageSize(file: File) {
	return new Promise<{ width: number, height: number }>((res) => {
		const img = new Image();
		img.src = URL.createObjectURL(file);
		img.onload = () => {
			res({
				width: img.width,
				height: img.height
			})
		}
	})
}

export function getVideoSize(file: File) {
	return new Promise<{ width: number, height: number }>((res) => {
		const video = document.createElement('video');
		video.src = URL.createObjectURL(file);
		video.addEventListener('loadedmetadata', () => {
			res({
				width: video.videoWidth,
				height: video.videoHeight
			})
		});
	})
}