import * as onnx from "onnxjs";
import React, { useEffect } from "react";
import MainSection from "./components/MainSection";
import model from "./models/model.onnx";

function App() {
	async function inference() {
		const session = new onnx.InferenceSession();
		await session.loadModel(model);
		const inputTensor = new onnx.Tensor(new Float32Array(784), "float32", [1, 784]);
		const outputMap = await session.run([inputTensor]);
		const outputTensor = outputMap.values().next().value;
		console.log(outputTensor.data);
	}

	return (
		<>
			<MainSection></MainSection>
		</>
	);
}

export default App;
