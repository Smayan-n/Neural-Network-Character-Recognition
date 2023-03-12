import { useState } from "react";
import { SimpleCanvas } from "../scripts/CanvasHelper.js";
import { distance, interpolate, lerp } from "../scripts/Utility.js";
import "../styles/CanvasSection.css";
import { useOnDraw } from "./Hooks.js";

const pixelSize = 20;
function CanvasSection() {
	const { onMouseDown, onMouseMove, setCanvasRef } = useOnDraw(handleDraw);
	//array that stores top-left positions of pixels in the 28x28 grid
	const [pixelPositions, setPixelPositions] = useState(null);

	useState(() => {
		//set up empty 28x28 array
		const pixels = new Array(28);
		for (let i = 0; i < 28; i++) {
			pixels[i] = new Array(28);
		}

		//store top-left positions of pixels in array
		for (let row = 0; row < 28; row += 1) {
			for (let col = 0; col < 28; col += 1) {
				pixels[row][col] = { x: col * pixelSize, y: row * pixelSize };
			}
		}
		setPixelPositions(pixels);
	}, []);

	//callback function that runs when mouse button is pressed and mouse is moving on canvas
	function handleDraw(ctx, point, prevPoint) {
		prevPoint = prevPoint ? prevPoint : point;
		const points = interpolate(prevPoint, point, 0.2);
		points.forEach((point) => {
			drawPixel(ctx, point);
		});
	}

	function drawPixel(ctx, point) {
		const simpleCanvas = new SimpleCanvas(ctx);
		const max_intensity = 255;
		const mid1_intensity = 180;
		const mid2_intensity = 128;
		const min_intensity = 20;

		const pixel = getPixelAtPos(point);
		//
		let intensity = getPixelIntensity(max_intensity, mid1_intensity, pixel, point, ctx, false);
		// console.log(intensity);
		simpleCanvas.rect(
			pixel.x,
			pixel.y,
			pixelSize,
			pixelSize,
			"",
			`rgba(${intensity}, ${intensity}, ${intensity}, ${1})`
		);

		const surrPixels = getSurroundingPixels(point);
		// console.log(surrPixels);
		surrPixels.forEach((pixel) => {
			intensity = getPixelIntensity(mid2_intensity, min_intensity, pixel, point, ctx, true);
			simpleCanvas.rect(
				pixel.x,
				pixel.y,
				pixelSize,
				pixelSize,
				"",
				`rgba(${intensity}, ${intensity}, ${intensity}, ${1})`
			);
		});
	}

	function getPixelIntensity(minIntensity, maxIntensity, pixel, pos, ctx, surroundingPixel) {
		const pixelCenter = { x: Math.round(pixel.x + pixelSize / 2), y: Math.round(pixel.y + pixelSize / 2) };

		let distFromCenter = distance(pos, pixelCenter);
		if (surroundingPixel) {
			distFromCenter = Math.round(distFromCenter - pixelSize / 2);
		}

		let intensity = ctx.getImageData(pixelCenter.x, pixelCenter.y, 1, 1).data[0];
		let newIntensity = lerp(minIntensity, maxIntensity, distFromCenter / (pixelSize / 2));

		if (surroundingPixel) if (newIntensity > minIntensity) newIntensity = minIntensity;

		if (intensity < newIntensity) intensity = newIntensity;
		return intensity;
	}

	function getSurroundingPixels(point) {
		//TODO: fix try catch statement
		const surrPixels = [];
		const { rowIndex, colIndex } = getPixelIndices(point);
		try {
			surrPixels.push(pixelPositions[rowIndex][colIndex + 1]);
			surrPixels.push(pixelPositions[rowIndex + 1][colIndex]);
			surrPixels.push(pixelPositions[rowIndex][colIndex - 1]);
			surrPixels.push(pixelPositions[rowIndex - 1][colIndex]);
		} catch (err) {}

		return surrPixels;
	}

	//returns a pixel at given x, y coord
	function getPixelAtPos(point) {
		const indices = getPixelIndices(point);
		return pixelPositions[indices.rowIndex][indices.colIndex];
	}

	const getPixelIndices = (point) => {
		return { rowIndex: Math.floor(point.y / pixelSize), colIndex: Math.floor(point.x / pixelSize) };
	};

	//---------------------------------------------//
	return (
		<section className="canvas-section">
			{/*ref prop takes a function and passes in the reference of canvas*/}
			<canvas
				width={560}
				height={560}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				ref={setCanvasRef}
				className="canvas"
			></canvas>
		</section>
	);
}

export default CanvasSection;
