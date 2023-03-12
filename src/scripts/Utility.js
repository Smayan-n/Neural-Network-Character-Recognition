function interpolate(p1, p2, step_size = 0.05) {
	//return a lost of interpolated points between p1 and p2 with given step size
	//p1, p2 = previous position, current position

	const direction = { x: p2.x - p1.x, y: p2.y - p1.y };
	const coords = [];
	for (let i = 0; i <= 1; i += step_size) {
		const x = Math.round(p1.x + i * direction.x);
		const y = Math.round(p1.y + i * direction.y);
		coords.push({ x: x, y: y });
	}
	return coords;
}
function distance(p1, p2) {
	return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

function lerp(a, b, t) {
	return (1 - t) * a + t * b;
}

export { interpolate, distance, lerp };
