import { basePath, serverUrl } from "@/constants/path";
import axios from "axios";

export const getRegionInfo = async (start: string): Promise<regionInfoObj | undefined> => {
	const { data } = await axios.get(`${basePath}/api/region-info?start=${start}`);
	if (data.ok) return { regionInfo: data.regionInfo, filteredInfo: data.filteredInfo };
};
export const getGisRegionInfo = async (start: string): Promise<regionInfoObj | undefined> => {
	const { data } = await axios.get(`${serverUrl}/gis/regionInfo?date=${start}`);
	if (data) return { regionInfo: data, filteredInfo: {} };
};

type regionInfoObj = {
	regionInfo: Record<string, RegionInfo>;
	filteredInfo: Record<string, RegionInfo>;
};
