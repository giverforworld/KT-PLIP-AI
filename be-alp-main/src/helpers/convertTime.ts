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

export function formatTimeZone(timeZone: string | undefined): string {
  if (timeZone === undefined || timeZone === "-") return "-";
  const time = parseInt(timeZone, 10);
  const isPM = time >= 12;
  const hour = time % 12 || 12;
  return `${isPM ? "오후" : "오전"} ${hour}시`;
}

export function convertMinutesToHoursDecimal(minutes: number): any {
  return +(minutes / 60).toFixed(2);
}

export function formatKSTTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  // 한국 시간으로 변환 (UTC+9)
  const kstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const month = String(kstDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(kstDate.getUTCDate()).padStart(2, "0");
  const hour = String(kstDate.getUTCHours()).padStart(2, "0");

  return `${month}/${day} ${hour}:00`;
}
