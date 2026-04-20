/* 
* ALP version 1.0

* Copyright © 2024 kt corp. All rights reserved.

* 

* This is a proprietary software of kt corp, and you may not use this file except in

* compliance with license agreement with kt corp. Any redistribution or use of this

* software, with or without modification shall be strictly prohibited without prior written

* approval of kt corp, and the copyright notice above does not evidence any actual or

* intended publication of such software.

*/

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import type { NumericArray } from "@math.gl/core";
import { AccessorFunction, DefaultProps } from "@deck.gl/core";
import { PathLayer, PathLayerProps } from "@deck.gl/layers";

const defaultProps: DefaultProps<TripsLayerProps> = {
	fadeTrail: true,
	trailLength: { type: "number", value: 120, min: 0 },
	currentTime: { type: "number", value: 0, min: 0 },
	getTimestamps: { type: "accessor", value: (d: any) => d.timestamps },
};

/** All properties supported by TripsLayer. */
export type TripsLayerProps<DataT = unknown> = _TripsLayerProps<DataT> & PathLayerProps<DataT>;

/** Properties added by TripsLayer. */
type _TripsLayerProps<DataT = unknown> = {
	/**
	 * Whether or not the path fades out.
	 * @default true
	 */
	fadeTrail?: boolean;
	/**
	 * Trail length.
	 * @default 120
	 */
	trailLength?: number;
	/**
	 * The current time of the frame.
	 * @default 0
	 */
	currentTime?: number;
	/**
	 * Timestamp accessor.
	 */
	getTimestamps?: AccessorFunction<DataT, NumericArray>;
};

/** Render animated paths that represent vehicle trips. */
export default class TripsLayerCustom<DataT = any, ExtraProps extends {} = {}> extends PathLayer<
	DataT,
	Required<_TripsLayerProps<DataT>> & ExtraProps
> {
	static layerName = "TripsLayer";
	static defaultProps = defaultProps;

	getShaders() {
		const shaders = super.getShaders();
		shaders.inject = {
			"vs:#decl": `\
uniform float trailLength;
in float instanceTimestamps;
in float instanceNextTimestamps;
out float vTime;
out float widthMultiplier;
`,
			// Timestamp of the vertex
			"vs:#main-end": `\
vTime = instanceTimestamps + (instanceNextTimestamps - instanceTimestamps) * vPathPosition.y / vPathLength;
widthMultiplier = width.x;
`,
			"fs:#decl": `\
uniform bool fadeTrail;
uniform float trailLength;
uniform float currentTime;
in float vTime;
in float widthMultiplier;
`,
			// Drop the segments outside of the time window
			// 			"fs:#main-start": `\
			// if(vTime > currentTime || (fadeTrail && (vTime < currentTime - trailLength))) {
			//   discard;
			// }
			// `,
			// Fade the color (currentTime - 100%, end of trail - 0%)
			"fs:DECKGL_FILTER_COLOR": `\
if(fadeTrail) {
  float offsetPos = abs(geometry.uv.x)/35.0 * widthMultiplier * 1000.0;
  color.a *= 1.0 - fract(currentTime - (vTime + offsetPos)) / (trailLength);//* widthMultiplier * 30.0);
  // color.a *= 1.0 - fract(currentTime - vTime - offsetPos) / trailLength;
}
`,
		};
		return shaders;
	}

	initializeState() {
		super.initializeState();

		const attributeManager = this.getAttributeManager();
		attributeManager!.addInstanced({
			timestamps: {
				size: 1,
				accessor: "getTimestamps",
				shaderAttributes: {
					instanceTimestamps: {
						vertexOffset: 0,
					},
					instanceNextTimestamps: {
						vertexOffset: 1,
					},
				},
			},
		});
	}

	draw(params: any) {
		const { fadeTrail, trailLength, currentTime } = this.props;

		params.uniforms = {
			...params.uniforms,
			fadeTrail,
			trailLength,
			currentTime,
		};

		super.draw(params);
	}
}
