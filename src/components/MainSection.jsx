import React, { useRef, useState } from "react";
import "../styles/MainSection.css";
import CanvasSection from "./CanvasSection";
import OutputSection from "./OutputSection";

function MainSection() {
	const [pixelArray, setPixelArray] = useState(null);
	const [clearCanvas, setClearCanvas] = useState(false);
	const [recognizer, setRecognizer] = useState("Digit");

	function handleInputChange(pixelArray) {
		setPixelArray(pixelArray);
	}

	//toggles clearCanvas state
	function handleClearCanvas() {
		setClearCanvas(!clearCanvas);
	}

	function handleSwitchRecognizer() {
		//clear canvas
		handleClearCanvas();
		if (recognizer === "Digit") setRecognizer("Letter");
		else setRecognizer("Digit");
	}

	return (
		<section className="main-section">
			<section className="main-btn-section">
				<button onClick={handleClearCanvas} className="clear-btn">
					Clear
				</button>
				<button onClick={handleSwitchRecognizer} className="switch-recognizer-btn">
					Switch to {recognizer === "Digit" ? "Letter" : "Digit"} Recognizer
				</button>
			</section>
			<section className="recognizer-section">
				<CanvasSection
					clearCanvasProps={[clearCanvas, handleClearCanvas]}
					onInputChange={handleInputChange}
				></CanvasSection>
				<OutputSection recognizer={recognizer} pixelArray={pixelArray}></OutputSection>
			</section>
		</section>
	);
}

export default MainSection;
