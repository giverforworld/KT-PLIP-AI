import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "@/helpers/token";
import { streamChatMessage } from "@/service/ai/aiReport";

export async function postAiReport(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<any> {
  const user = req.user;
  if (!user) {
    return res.status(400).json({ message: "Not user" });
  }

  const { data, title, regionName, period, dataType } = req.body;

  if (!data || !title) {
    return res
      .status(400)
      .json({ message: "data and title are required." });
  }

  const query = buildReportPrompt({ data, title, regionName, period, dataType });

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  streamChatMessage(
    { query, user: user.userId },
    (chunk) => {
      res.write(chunk);
    },
    () => {
      res.end();
    },
    (error) => {
      console.error("AI Report streaming error:", error.message);
      res.write(
        `data: ${JSON.stringify({ event: "error", message: error.message })}\n\n`
      );
      res.end();
    }
  );
}

function buildReportPrompt(params: {
  data: any;
  title: string;
  regionName?: string;
  period?: string;
  dataType?: string;
}): string {
  const { data, title, regionName, period, dataType } = params;

  const dataStr =
    typeof data === "string" ? data : JSON.stringify(data, null, 2);

  return `다음 데이터를 기반으로 분석 리포트를 한글로 작성해주세요.

## 리포트 정보
- 제목: ${title}
${regionName ? `- 지역: ${regionName}` : ""}
${period ? `- 기간: ${period}` : ""}
${dataType ? `- 데이터 유형: ${dataType}` : ""}

## 데이터
${dataStr}

## 작성 형식
1. 개요 (1-2문장)
2. 주요 지표 요약 (핵심 수치)
3. 변화 추이 분석
4. 특이사항 및 원인 분석
5. 시사점 및 정책 제언

데이터에 있는 수치만 사용하고, 존재하지 않는 수치를 만들어내지 마세요.`;
}
