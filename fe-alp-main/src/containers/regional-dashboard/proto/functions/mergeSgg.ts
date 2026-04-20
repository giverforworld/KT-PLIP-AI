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

import {
	FeatureCollection,
	Feature,
	Polygon,
	GeometryCollection,
	GeoJsonProperties,
} from "geojson";
import * as d3 from "d3-geo"; // Import from 'd3-geo' for geo-related functions
import { Topology } from "topojson-specification";
import { merge } from "topojson-client";

type CustomRegionInfo = {
	[key: string]: {
		regionName: string;
		regionCode: number;
		codes: number[];
		// Any other properties you want to keep in the regionInfo object
	};
};

export function mergeSgg(
	geoJson: FeatureCollection,
	topoJson: Topology,
	groupedSgg: CustomRegionInfo,
	regionInfo: Record<string, RegionInfo>,
): {
	updatedGeoJson: FeatureCollection;
	updatedRegionInfo: Record<string, RegionInfo>;
} {
	// Array to store merged polygons
	const newFeatures: Feature<Polygon>[] = [];
	// Set to track processed region codes
	const processedCodes = new Set<string>();

	const geometryCollection = topoJson.objects[
		Object.keys(topoJson.objects)[0]
	] as GeometryCollection;

	// Get all geometries from the collection
	const geometries = geometryCollection.geometries;

	// Create a copy of the regionInfo to avoid mutating the original input
	const updatedRegionInfo = { ...regionInfo };

	// Iterate over each group in groupedSgg
	Object.values(groupedSgg).forEach((group) => {
		const { regionCode, regionName, codes } = group;

		// Filter geometries that match the region codes in 'codes'
		const filteredGeometries = geometries.filter((geometry: any) => {
			const regionCd = String(geometry.properties?.SGG_CD); // Convert SGG_CD to string
			return codes.some((code) => regionCd === String(code)); // Check if regionCd matches any code in 'codes'
		});

		if (filteredGeometries.length > 0) {
			// Merge geometries using TopoJSON
			const mergedGeometry = merge(topoJson, filteredGeometries as any);

			// Calculate the centroid of the merged geometry
			const center = d3.geoCentroid(mergedGeometry);

			// Use properties from the first filtered geometry
			const { SIDO_NM, SGG_NM, SGG_CD, SIDO_CD } = (filteredGeometries[0] as any)?.properties;

			// Create a new merged GeoJSON feature
			const mergedGeoJsonFeature: Feature<Polygon> = {
				type: "Feature",
				geometry: mergedGeometry as any,
				properties: {
					sidoCode: SIDO_CD, // Province code
					sggCode: regionCode, // Use regionCode from groupedSgg
					sidoName: SIDO_NM, // Province name
					sggName: regionName, // Use regionName from groupedSgg
					subRegions: codes,
					center, // Centroid of the merged geometry
				},
			};

			newFeatures.push(mergedGeoJsonFeature);

			// Update the new regionInfo object
			updatedRegionInfo[String(regionCode)] = {
				name: regionName,
				sidoCode: SIDO_CD,
				sggCode: String(regionCode),
				sidoName: SIDO_NM,
				sggName: regionName,
				center,
			};

			// Add processed codes to the processedCodes set and remove them from updatedRegionInfo
			filteredGeometries.forEach((geometry: any) => {
				const regionCd = String(geometry.properties?.SGG_CD);
				processedCodes.add(regionCd); // Store processed region code

				// Remove merged regions from updatedRegionInfo
				if (updatedRegionInfo[regionCd]) {
					delete updatedRegionInfo[regionCd];
				}
			});
		}
	});

	// Filter out merged polygons from the original geoJson
	const filteredFeatures = geoJson.features.filter(
		(feature) => !processedCodes.has(String(feature.properties?.regionCode)),
	);

	// Create updated FeatureCollection with new and existing features
	const updatedGeoJson: FeatureCollection = {
		type: "FeatureCollection",
		features: [...filteredFeatures, ...newFeatures],
	};

	// Return the updated GeoJSON and updatedRegionInfo
	return { updatedGeoJson, updatedRegionInfo };
}

// Example usage
// const { updatedGeoJson, updatedRegionInfo } = mergeSgg(originalGeojson, topoJson, groupedSgg, regionInfo);
// console.log(updatedGeoJson, updatedRegionInfo);
