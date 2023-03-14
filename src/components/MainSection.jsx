import React, { useRef, useState } from "react";
import "../styles/MainSection.css";
import CanvasSection from "./CanvasSection";
import OutputSection from "./OutputSection";

function MainSection() {
	const [pixelArray, setPixelArray] = useState(null);
	const [clearCanvas, setClearCanvas] = useState(false);

	function handleInputChange(pArray) {
		setPixelArray(pArray);
	}

	//toggles clearCanvas state
	function handleClearCanvas() {
		if (clearCanvas) setClearCanvas(false);
		else {
			setClearCanvas(true);
		}
	}

	return (
		<section className="main-section">
			<button onClick={handleClearCanvas} className="clear-btn">
				Clear
			</button>
			<section className="recognizer-section">
				<CanvasSection
					clearCanvasProps={[clearCanvas, handleClearCanvas]}
					onInputChange={handleInputChange}
				></CanvasSection>
				<OutputSection pixelArray={pixelArray}></OutputSection>
			</section>
		</section>
	);
}

export default MainSection;
