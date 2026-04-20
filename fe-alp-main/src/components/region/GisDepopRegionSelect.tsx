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

import * as React from "react";
import { FaChevronDown } from "react-icons/fa";
import { RadioButton } from "../buttons/RadioButton";
import { getRegionString } from "@/libs/gisOptionFunc";
import { useShowToast } from "@/hooks/useToastShow";
import { UserContext } from "@/context/UserProviderContainer";

interface GisDepopRegionSelectProps {
  mapIdx?: 0 | 1;
  isAdm?: boolean;
  gisSettings: GisSettings;
  setGisSettings: React.Dispatch<React.SetStateAction<GisSettings>>;
  regionInfo: Record<string, RegionInfo>;
  tempSettings?: GisSettings;
  setTempSettings?: React.Dispatch<React.SetStateAction<GisSettings>>;
  gisSettingKey?: any;
}

export default function GisDepopRegionSelect({
  mapIdx = 0,
  isAdm,
  gisSettings,
  setGisSettings,
  regionInfo,
  tempSettings,
  setTempSettings,
  gisSettingKey,
}: Readonly<GisDepopRegionSelectProps>) {
  const showToast = useShowToast();

  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const [showRegionSelect, setShowRegionSelect] = React.useState(false);
  const selectedSidoRadioRef = React.useRef<HTMLInputElement | null>(null);

  // 체류인구일 때 지역 초기화
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error("GIScontainer must be used within a UserProderContainer");
  }
  let time = tempSettings?.maps[0].startDate;
  
  const { user } = context;
  const userRegion = {
    sido: {
      name: user!.baseInfo.toString().slice(0, 2) === '51' && time! < 202307 
        ? '강원도' 
        : user!.baseInfo.toString().slice(0, 2) === '52' && time! < 202403
        ? '전라북도'
        : user!.baseInfo.toString().slice(0, 2) === '42' && time! > 202306
        ? '강원특별자치도'
        : user!.baseInfo.toString().slice(0, 2) === '45' && time! > 202402
        ? '전북특별자치도'
        : user!.baseRegion.sido.name,
      code: user!.baseInfo.toString().slice(0, 2) === '51' && time! < 202307 
        ? '42'
        : user!.baseInfo.toString().slice(0, 2) === '52' && time! < 202403
        ? '45'
        : user!.baseInfo.toString().slice(0, 2) === '42' && time! > 202306
        ? '51'
        : user!.baseInfo.toString().slice(0, 2) === '45' && time! > 202402
        ? '52'
        : user!.baseRegion.sido.code,
    },
    sgg: {
      name: user!.baseRegion.sgg.name ?? "",
      code: user!.baseRegion.sgg.code.toString().slice(0, 2) === '51' && time! < 202307 
      ? '42'+user?.baseRegion.sgg.code.toString().slice(2)
      : user!.baseRegion.sgg.code.toString().slice(0, 2) === '52' && time! < 202403
      ? '45'+user?.baseRegion.sgg.code.toString().slice(2)
      : user!.baseRegion.sgg.code.toString().slice(0, 2) === '42' && time! > 202306
      ? '51'+user?.baseRegion.sgg.code.toString().slice(2)
      : user!.baseRegion.sgg.code.toString().slice(0, 2) === '45' && time! > 202402
      ? '52'+user?.baseRegion.sgg.code.toString().slice(2)
      : user!.baseRegion.sgg.code ?? "",
    },
  };

  // gisSettings 또는 tempSettings에서 값을 가져오도록 설계
  const [tempRegion, setTempRegion] = React.useState({
    name: tempSettings?.analysisSubType === 1 ? userRegion.sido.name
    : gisSettings?.regionName ?? tempSettings?.regionName ?? "",
    code: tempSettings?.analysisSubType === 1 ? userRegion.sido.code
    : tempSettings?.analysisType === 2 ? userRegion.sgg.code ?? userRegion.sido.code 
    : gisSettings?.regionCode?.toString().slice(0, 2) === '51' && time! < 202307 
    ? '42'+gisSettings?.regionCode?.toString().slice(2)
    : gisSettings?.regionCode?.toString().slice(0, 2) === '52' && time! < 202403 
    ? '45'+gisSettings?.regionCode?.toString().slice(2)
    : gisSettings?.regionCode?.toString().slice(0, 2) === '42' && time! > 202306 
    ? '51'+gisSettings?.regionCode?.toString().slice(2) 
    : gisSettings?.regionCode?.toString().slice(0, 2) === '45' && time! > 202402 
    ? '52'+gisSettings?.regionCode?.toString().slice(2) 
    : gisSettings?.regionCode?.toString()
    ?? tempSettings?.regionCode?.toString() ?? "",
  });

  React.useEffect(() => {
    setTempRegion({
      name: tempSettings?.analysisSubType === 1 ? userRegion.sido.name
      : gisSettings?.regionName ?? tempSettings?.regionName ?? "",
      code: tempSettings?.analysisSubType === 1 ? userRegion.sido.code
      : tempSettings?.analysisType ? userRegion.sgg.code ?? userRegion.sido.code 
      : gisSettings?.regionCode?.toString().slice(0, 2) === '42'
      ? '51'+gisSettings?.regionCode?.toString().slice(2) 
      : gisSettings?.regionCode?.toString().slice(0, 2) === '45'
      ? '52'+gisSettings?.regionCode?.toString().slice(2) 
      : gisSettings?.regionCode?.toString()
      ?? tempSettings?.regionCode?.toString() ?? ""
    })
  }, [tempSettings?.analysisType, tempSettings?.analysisSubType])

  let foundRegionInfo = regionInfo[
    tempRegion.code.slice(0,2) === '51' && time! < 202307 
    ? '42'+tempRegion.code.slice(2)
    : tempRegion.code.slice(0,2) === '52' && time! < 202403 
    ? '45'+tempRegion.code.slice(2)
    : tempRegion.code.slice(0,2) === '42' && time! > 202306 
    ? '51'+tempRegion.code.slice(2)
    : tempRegion.code.slice(0,2) === '45' && time! > 202402 
    ? '52'+tempRegion.code.slice(2)
    : tempRegion.code ?? user?.baseRegion.sido.code!
    // : tempRegion.code
    ] 
    ?? regionInfo[tempSettings?.regionCode!]
    ?? regionInfo[gisSettings.regionCode] ?? regionInfo[11];
  
  
  // 모달 외부 클릭 시 닫기
  const handleClickOutside = (event: MouseEvent) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
      handleConfirm();
      setShowRegionSelect(false);
    }
  };

  React.useEffect(() => {
    if (showRegionSelect) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [foundRegionInfo, showRegionSelect]);

  React.useEffect(() => {
    if (setTempSettings) {
      setTempSettings((prev: any) => ({
        ...prev,
        regionName: tempRegion.name,
        regionCode: tempRegion.code,
        regionCodeArr: [tempRegion.code],
        regionNameArr: [tempRegion.name],
      }));
    }
  }, [tempRegion]);

  // React.useEffect(() => {
  //   if (gisSettings.analysisType === 1 || tempSettings?.analysisType === 0 && tempRegion.code.length === 2) {
  //     setTempRegion({
  //       name: gisSettings?.regionName,
  //       code: tempSettings?.analysisType === 2 ? userRegion.sgg.code ?? userRegion.sido.code 
  //       : gisSettings?.regionCode?.toString().slice(0, 2) === '51' && time! < 202307 
  //       ? '42'+gisSettings?.regionCode?.toString().slice(2)
  //       : gisSettings?.regionCode?.toString().slice(0, 2) === '52' && time! < 202403 
  //       ? '45'+gisSettings?.regionCode?.toString().slice(2) 
  //       : gisSettings?.regionCode?.toString().slice(0, 2) === '42' && time! > 202306 
  //       ? '51'+gisSettings?.regionCode?.toString().slice(2) 
  //       : gisSettings?.regionCode?.toString().slice(0, 2) === '45' && time! > 202402 
  //       ? '52'+gisSettings?.regionCode?.toString().slice(2) 
  //       : gisSettings?.regionCode?.toString(),
  //     });
  //     setShowRegionSelect(false);
  //   }
  // }, [gisSettings]);

  const handleInputClick = () => {
      setShowRegionSelect(!showRegionSelect);
  };

  const handleConfirm = () => {
    if (setTempSettings) {
      setTempSettings((prev: any) => ({
        ...prev,
        regionName: tempRegion.name,
        regionCode: tempRegion.code,
        regionCodeArr: [tempRegion.code],
        regionNameArr: [tempRegion.name],
        maps: [{...prev.maps[0], isSearch: false,}, {...prev.maps[1], isSearch: false,}]
      }));
    } else {
      setGisSettings((prev: any) => ({
        ...prev,
        regionName: tempRegion.name,
        regionCode: tempRegion.code,
        regionCodeArr: [tempRegion.code],
        regionNameArr: [tempRegion.name],
        ...(tempRegion.code.length > 5 && { isGrid: true }),
        maps: [
          { ...prev.maps[0], isSearch: false },
          { ...prev.maps[1], isSearch: false },
        ],
      }));
    }
    setShowRegionSelect(false);
  };

  const handleRegionChange = (key: any, value: any) => {
    const foundRegionInfo = regionInfo[key];
    if (foundRegionInfo) {
      setTempRegion((prevTempRegion: any) => {
        if (key.length === 2) {
          return {
            name: foundRegionInfo.sidoName,
            code: key,
          };
        } else if (key.length === 5) {
          return {
            name: `${foundRegionInfo.sidoName} ${foundRegionInfo.sggName}`,
            code: key,
          };
        }
        return prevTempRegion;
      });
    } else {
      console.error(`No region info found for code: ${key}`);
    }
  };

  return (
    <div ref={wrapperRef}>
      <button
        className={`${mapIdx === 1 ? "bg-backGray" : "bg-white"} flex w-full cursor-default items-center justify-between rounded-sm border p-2`}
        onClick={handleInputClick}
        disabled={mapIdx === 1}
      >
        <input
          type="text"
          // value={mapIdx === 1 ? gisSettings.regionName : getRegionString(foundRegionInfo)}
          value={mapIdx === 1 ? gisSettings.regionName 
            // : tempSettings?.analysisType === 2
            // ? `${userRegion.sido.name} ${userRegion.sgg.name}`
            : getRegionString(foundRegionInfo)}
          readOnly
          className={`${mapIdx === 1 ? "text-[#666666]" : ""} w-full cursor-pointer bg-transparent outline-none`}
          placeholder="지역 선택"
        />
        <FaChevronDown className="w-9 text-gray-500" />
      </button>
      {showRegionSelect && (
        <div
          className={`custom-scrollbar mt-0.5 flex w-inherit flex-col rounded-md border border-[#e5e7eb] bg-white ${!tempSettings ? "absolute z-50 h-80" : ""}`}
        >
          {/* 시도 */}
          <div className="custom-scrollbar flex h-80 w-full bg-white">
            <ul
              className={`${
                tempRegion.name.split(" ")[0]
                  ? !tempSettings || tempSettings.analysisSubType === 1
                    ? "w-full min-w-40"
                    : "w-1/3"
                  : "w-1/2"
              } custom-scrollbar h-inherit overflow-y-auto border-r border-[#e5e7eb]`}
            >
              {Object.entries(regionInfo)
                // .filter(([key, _]) => tempSettings?.analysisSubType === 1 && key === userRegion.sido.code)
                .filter(([key, _]) => key.length === 2)
                .map(([key, value], index, array) => {
                  const isLastItem = index === array.length - 1;
                  return (
                    <li
                      key={key}
                      className={`${
                        !isLastItem ? "border-b border-[#e5e7eb]" : ""
                      } break-keep p-2 hover:bg-[#F3F3F3]`}
                    >
                      <RadioButton
                        id={key}
                        name={key}
                        label={value.sidoName || value.name}
                        value={tempSettings?.analysisType === 2 ? userRegion.sido.name : value.sidoName || value.name}
                        checked={tempRegion.code.slice(0, 2) === key}
                        onChange={() => handleRegionChange(key, value)}
                        ref={key === tempRegion.code.slice(0, 2) ? selectedSidoRadioRef : null}
                      />
                    </li>
                  );
                })}
            </ul>
          </div>
          <div
            className={`flex justify-end ${!tempSettings ? "border" : "border-t"} border-[#e5e7eb] bg-white p-2`}
          >
            <button
              onClick={handleConfirm}
              className={`rounded bg-[#D63457] px-4 py-1 text-white ${
                (tempSettings?.analysisType === 1 && tempRegion.code.length === 2) ||
                ((tempSettings?.gridScale === 0.05 || tempSettings?.analysisType === 3) &&
                  tempRegion.code.length <= 5)
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
