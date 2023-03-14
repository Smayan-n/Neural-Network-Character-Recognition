import * as onnx from "onnxjs";
import { useEffect, useState } from "react";
import digitModel from "../models/digit_model.onnx";
import "../styles/OutputSection.css";

//make a onnx inference session
const session = new onnx.InferenceSession();
session.loadModel(digitModel);

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
	const { pixelArray } = props;
	const [output, setOutput] = useState(null);

	useEffect(() => {
		async function predict() {
			if (pixelArray) {
				//convert pixelArray to tensor
				const inputTensor = new onnx.Tensor(pixelArray.flat(), "float32", [1, 784]);
				const outputMap = await session.run([inputTensor]);
				const outputTensor = outputMap.values().next().value;
				const outputArr = Array.from(outputTensor.data);
				// const pred = outputArr.indexOf(Math.max(...outputArr));

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

	function formattedOutput(sort = false) {
		//returns output object as an array with [key, value] elements - with optional sort

		const out = [];
		for (let key in output) {
			out.push([key, output[key]]);
		}

		if (sort) {
			//sort array
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

	return (
		<section className="output-section">
			<div className="prediction-container">
				{output
					? formattedOutput(true).map((entry) => {
							const [key, value] = entry;
							const barWidth = getBarWidth();
							return (
								<div key={key} className="prediction">
									{digitMap[key]}
									<div className="prediction-bar">
										<div
											style={{ width: Math.floor(value * barWidth) }}
											className="prediction-bar-out"
										>
											{(value * 100).toFixed(2)}%
										</div>
									</div>
								</div>
							);
					  })
					: ""}
			</div>
		</section>
	);
}

export default OutputSection;
