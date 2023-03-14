import { useEffect, useRef, useState } from "react";
import { SimpleCanvas } from "../scripts/CanvasHelper.js";
import { distance, interpolate, lerp } from "../scripts/Utility.js";
import "../styles/CanvasSection.css";
import { useOnDraw } from "./Hooks.js";

// const pixelSizeRef.current = 20;
function CanvasSection(props) {
	const { clearCanvasProps, onInputChange } = props;
	const [clearCanvas, onClearCanvas] = clearCanvasProps;

	const { onMouseDown, onMouseMove, setCanvasRef } = useOnDraw(handleDraw);
	const windowResizeListenerRef = useRef(null);
	const canvasRef = useRef(null);

	//array that stores top-left positions of pixels in the 28x28 grid
	const [pixelPositions, setPixelPositions] = useState(null);
	//pixel size
	const pixelSizeRef = useRef(getCanvasSize() / 28);

	//effect that checks if clearCanvas prop from parent is true and clear canvas
	useEffect(() => {
		if (clearCanvas) {
			const ctx = canvasRef.current.getContext("2d");
			ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
			onClearCanvas();
		}
	});

	//effect sets up resize listener and initializes pixelPositions
	useEffect(() => {
		const windowResizeListener = (e) => {
			const canvas = canvasRef.current;
			if (canvas) {
				const size = getCanvasSize();
				canvas.width = size;
				canvas.height = size;
				pixelSizeRef.current = size / 28;
				setupPixelPositions();
			}
		};
		windowResizeListenerRef.current = windowResizeListener;
		window.addEventListener("resize", windowResizeListener);

		setupPixelPositions();

		return () => {
			//TODO: Cleanup!!
			if (windowResizeListenerRef) window.removeEventListener("resize", windowResizeListenerRef.current);
		};
	}, []);

	function setRef(ref) {
		if (!ref) return;
		canvasRef.current = ref;
		setCanvasRef(ref);
	}

	//returns canvas size depending on window width
	function getCanvasSize() {
		const winWidth = Math.floor(window.innerWidth / 2.3);
		const rem = winWidth % 28;
		const canvasSize = winWidth - rem;
		return canvasSize;
	}

	function setupPixelPositions() {
		//set up empty 28x28 array
		const pixels = new Array(28);
		for (let i = 0; i < 28; i++) {
			pixels[i] = new Array(28);
		}

		//store top-left positions of pixels in array
		for (let row = 0; row < 28; row += 1) {
			for (let col = 0; col < 28; col += 1) {
				pixels[row][col] = { x: col * pixelSizeRef.current, y: row * pixelSizeRef.current };
			}
		}
		setPixelPositions(pixels);
	}

	//callback function that runs when mouse button is pressed and mouse is moving on canvas
	//loop function
	function handleDraw(ctx, point, prevPoint) {
		prevPoint = prevPoint ? prevPoint : point;
		const points = interpolate(prevPoint, point, 0.075);
		points.forEach((point) => {
			drawPixel(ctx, point);
		});

		//callback function to parent component
		onInputChange(getPixelArray(ctx));
	}

	function getPixelArray(ctx) {
		const pixelArray = [];
		pixelPositions.forEach((row) => {
			const rows = [];
			row.forEach((pixel) => {
				const pixelCenter = getPixelCenter(pixel);
				const intensity = ctx.getImageData(pixelCenter.x, pixelCenter.y, 1, 1).data[0];
				const normalized = (intensity / 255 - 0.1307) / 0.3081;
				rows.push(normalized);
			});
			pixelArray.push(rows);
		});
		// const dilated = dilate2DArray(pixelArray);
		// for (let r = 0; r < dilated.length; r++) {
		// 	for (let c = 0; c < dilated[r].length; c++) {
		// 		dilated[r][c] = (dilated[r][c] / 255 - 0.1307) / 0.3081;
		// 	}
		// }
		return pixelArray;
	}

	function drawPixel(ctx, point) {
		const simpleCanvas = new SimpleCanvas(ctx);
		const max_intensity = 255;
		const mid1_intensity = 180;
		const mid2_intensity = 128;
		const min_intensity = 20;

		const pixel = getPixelAtPos(point);
		let intensity = getPixelIntensity(max_intensity, mid1_intensity, pixel, point, ctx, false);
		simpleCanvas.rect(
			pixel.x,
			pixel.y,
			pixelSizeRef.current,
			pixelSizeRef.current,
			"",
			`rgba(${intensity}, ${intensity}, ${intensity}, ${1})` //opacity set to 1
		);

		const surrPixels = getSurroundingPixels(point);
		surrPixels.forEach((pixel) => {
			intensity = getPixelIntensity(mid2_intensity, min_intensity, pixel, point, ctx, true);
			simpleCanvas.rect(
				pixel.x,
				pixel.y,
				pixelSizeRef.current,
				pixelSizeRef.current,
				"",
				`rgba(${intensity}, ${intensity}, ${intensity}, ${1})`
			);
		});
	}

	function getPixelIntensity(minIntensity, maxIntensity, pixel, pos, ctx, surroundingPixel) {
		const pixelCenter = getPixelCenter(pixel);

		let distFromCenter = distance(pos, pixelCenter);
		if (surroundingPixel) {
			distFromCenter = Math.round(distFromCenter - pixelSizeRef.current / 2);
		}

		let intensity = ctx.getImageData(pixelCenter.x, pixelCenter.y, 1, 1).data[0];
		let newIntensity = lerp(minIntensity, maxIntensity, distFromCenter / (pixelSizeRef.current / 2));

		if (surroundingPixel) if (newIntensity > minIntensity) newIntensity = minIntensity;

		if (intensity < newIntensity) intensity = newIntensity;
		return intensity;
	}

	function getSurroundingPixels(point) {
		const surrPixels = [];
		const { rowIndex, colIndex } = getPixelIndices(point);
		if (colIndex + 1 <= 27) {
			surrPixels.push(pixelPositions[rowIndex][colIndex + 1]);
		}
		if (rowIndex + 1 <= 27) {
			surrPixels.push(pixelPositions[rowIndex + 1][colIndex]);
		}
		if (colIndex - 1 >= 0) {
			surrPixels.push(pixelPositions[rowIndex][colIndex - 1]);
		}
		if (rowIndex - 1 >= 0) {
			surrPixels.push(pixelPositions[rowIndex - 1][colIndex]);
		}

		return surrPixels;
	}

	//returns a pixel at given x, y coord
	function getPixelAtPos(point) {
		const indices = getPixelIndices(point);
		return pixelPositions[indices.rowIndex][indices.colIndex];
	}

	function getPixelIndices(point) {
		return {
			rowIndex: Math.floor(point.y < 0 ? 0 : point.y / pixelSizeRef.current),
			colIndex: Math.floor(point.x / pixelSizeRef.current),
		};
	}

	function getPixelCenter(pixel) {
		return {
			x: Math.round(pixel.x + pixelSizeRef.current / 2),
			y: Math.round(pixel.y + pixelSizeRef.current / 2),
		};
	}

	//---------------------------------------------//
	return (
		<section className="canvas-section">
			{/*ref prop takes a function and passes in the reference of canvas*/}
			<canvas
				width={getCanvasSize()}
				height={getCanvasSize()}
				onMouseDown={onMouseDown}
				onMouseMove={onMouseMove}
				ref={setRef}
				className="canvas"
			></canvas>
		</section>
	);
}

export default CanvasSection;
