import * as onnx from "onnxjs";
import { useEffect, useRef, useState } from "react";
import cnnDigitModel from "../models/cnn_digit_model.onnx";
import digitModel from "../models/digit_model.onnx";
import letterModel from "../models/letter_model.onnx";
import "../styles/OutputSection.css";

const letterMap = {
	0: "None",
	1: "A",
	2: "B",
	3: "C",
	4: "D",
	5: "E",
	6: "F",
	7: "G",
	8: "H",
	9: "I",
	10: "J",
	11: "K",
	12: "L",
	13: "M",
	14: "N",
	15: "O",
	16: "P",
	17: "Q",
	18: "R",
	19: "S",
	20: "T",
	21: "U",
	22: "V",
	23: "W",
	24: "X",
	25: "Y",
	26: "Z",
};

const digitMap = {
	0: "Zero",
	1: "One",
	2: "Two",
	3: "Three",
	4: "Four",
	5: "Five",
	6: "Six",
	7: "Seven",
	8: "Eight",
	9: "Nine",
};
function OutputSection(props) {
	const { recognizer, pixelArray } = props;
	const [output, setOutput] = useState(null);

	const [isSessionInitialized, setIsSessionInitialized] = useState(false);
	const sessionRef = useRef(null);

	//only runs when component first mounts and when the recognizer changes
	useEffect(() => {
		setOutput(null);
		async function initializeInferenceSession() {
			//make a onnx inference session
			sessionRef.current = new onnx.InferenceSession();
			//loadModel returns a promise that has to be resolved
			if (recognizer === "Digit") {
				await sessionRef.current.loadModel(cnnDigitModel);
			} else {
				await sessionRef.current.loadModel(letterModel);
			}
			setIsSessionInitialized(true);
		}
		initializeInferenceSession();
	}, [recognizer]);

	//runs when pixelArray changes
	//NOTE: fix session not initialized error
	useEffect(() => {
		async function predict() {
			if (isSessionInitialized && pixelArray && pixelArray.length !== 0) {
				//convert pixelArray to tensor
				let input = pixelArray.flat();
				input = normalizeInput(input);
				let inputTensor;
				if (recognizer === "Digit") {
					inputTensor = new onnx.Tensor(input, "float32", [1, 1, 28, 28]);
				} else {
					inputTensor = new onnx.Tensor(input, "float32", [1, 784]);
				}

				//run inference
				const outputMap = await sessionRef.current.run([inputTensor]);
				const outputTensor = outputMap.values().next().value;
				const outputArr = Array.from(outputTensor.data);

				//convert output to object
				const out = {};
				outputArr.forEach((val, index) => {
					out[index] = val;
				});
				setOutput(out);
			}
		}
		predict();
	}, [pixelArray]);

	function normalizeInput(input) {
		//normalize input depending on model
		// if (recognizer === "Digit") return input.map((val) => (val / 255 - 0.1307) / 0.3081);
		// else return input.map((val) => (val / 255 - 0.5) / 0.5);
		//NOTE: for some reason this normalization works best for letter and digit model
		return input.map((val) => (val / 255 - 0.1307) / 0.3081);
	}

	function formattedOutput(sort = false) {
		//returns output object as an array with [key, value] elements - with optional sort

		let out = [];
		for (let key in output) {
			out.push([key, output[key]]);
		}

		//sort array
		if (sort) {
			out.sort((a, b) => b[1] - a[1]);
		}

		return out;
	}

	function getBarWidth() {
		//returns the prediction bar's width for display calculation
		const div = document.getElementsByClassName("prediction-bar")[0];
		if (div) {
			const rect = div.getBoundingClientRect();
			if (rect) return rect.width;
		}
		return 0;
	}

	function getOutputJsx(key, value) {
		const barWidth = getBarWidth();
		return (
			<div key={key} className="prediction">
				{recognizer === "Digit" ? digitMap[key] : letterMap[key]}
				<div className="prediction-bar">
					<div style={{ width: Math.floor(value * barWidth) }} className="prediction-bar-out">
						<div className="prediction-percentage">{(value * 100).toFixed(2)}%</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<section className="output-section">
			<div className="predictions-container">
				{output
					? formattedOutput(true)
							.splice(0, 10)
							.map((entry) => {
								const [key, value] = entry;
								return getOutputJsx(key, value);
							})
					: (recognizer === "Digit" ? Object.keys(digitMap) : Object.keys(letterMap).splice(1, 10)).map(
							(key) => {
								return getOutputJsx(key, 0);
							}
					  )}
			</div>
		</section>
	);
}

export default OutputSection;
