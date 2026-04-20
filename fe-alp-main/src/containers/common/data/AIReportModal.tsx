"use client";

import { useState, useRef, useEffect } from "react";
import BaseModal from "@/components/modals/BaseModal";
import { basePath } from "@/constants/path";

interface AIReportModalProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  data: DataContainer;
}

export default function AIReportModal({
  open,
  setOpen,
  data,
}: AIReportModalProps) {
  const [report, setReport] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      generateReport();
    }
    return () => {
      abortRef.current?.abort();
    };
  }, [open]);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = contentRef.current.scrollHeight;
    }
  }, [report]);

  const generateReport = async () => {
    setReport("");
    setError(null);
    setIsLoading(true);

    abortRef.current = new AbortController();

    try {
      const firstChart = data.charts?.[0] as any;
      const regionName = firstChart?.regionName || "";
      const options = data.options as any;
      const period = options
        ? `${options.start ?? ""} ~ ${options.end ?? ""}`
        : "";

      const body = {
        data: {
          summary: data.summary,
          charts: data.charts?.map((chart: any) => ({
            name: chart.name,
            regionName: chart.regionName,
            indicate: chart.indicate,
            data: chart.data,
          })),
        },
        title: data.title,
        regionName,
        period,
        dataType: data.page?.toUpperCase() || "",
      };

      const response = await fetch(`${basePath}/api/ai/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: abortRef.current.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error("AI 리포트 생성에 실패했습니다.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            if (
              parsed.event === "message" ||
              parsed.event === "agent_message"
            ) {
              setReport((prev) => prev + (parsed.answer || ""));
            } else if (parsed.event === "error") {
              setError(parsed.message || "오류가 발생했습니다.");
            }
          } catch {
            // non-JSON line, skip
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "AI 리포트 생성 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(report);
  };

  const handleClose = (value: boolean) => {
    if (!value) {
      abortRef.current?.abort();
    }
    setOpen(value);
  };

  return (
    <BaseModal
      open={open}
      setOpen={handleClose}
      title="AI 분석 리포트"
      width="w-2/3"
      buttons={
        report && !isLoading
          ? [
              {
                title: "복사",
                onClick: handleCopy,
                color: "outlined" as const,
              },
              {
                title: "재생성",
                onClick: generateReport,
                color: "primary" as const,
              },
            ]
          : []
      }
    >
      <div ref={contentRef} className="min-h-[300px]">
        {isLoading && !report && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-textGray">AI 리포트를 생성하고 있습니다...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}

        {report && (
          <div className="whitespace-pre-wrap text-sm leading-7 text-textDarkGray">
            {report}
            {isLoading && (
              <span className="inline-block h-4 w-1 animate-pulse bg-primary" />
            )}
          </div>
        )}
      </div>
    </BaseModal>
  );
}
