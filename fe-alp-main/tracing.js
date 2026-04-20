const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
const { AzureMonitorTraceExporter } = require('@azure/monitor-opentelemetry-exporter');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');
const { ConsoleSpanExporter } = require('@opentelemetry/sdk-trace-base');

// 리소스 정의
const resource = new Resource({
  [ATTR_SERVICE_NAME]: 'fe-alp'
});

// 환경에 따라 exporter 선택
let traceExporter;
let spanProcessor;

if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
  console.log('Initializing Azure Monitor OpenTelemetry...');
  traceExporter = new AzureMonitorTraceExporter({
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
  });
  spanProcessor = new BatchSpanProcessor(traceExporter);
} else {
  console.log('No Application Insights connection string found. Using console exporter for development.');
  traceExporter = new ConsoleSpanExporter();
  spanProcessor = new BatchSpanProcessor(traceExporter);
}

// SDK 초기화
const sdk = new NodeSDK({
  resource: resource,
  spanProcessor: spanProcessor,
  instrumentations: [getNodeAutoInstrumentations({
    // Next.js와 호환성을 위한 설정
    '@opentelemetry/instrumentation-fs': {
      enabled: false,
    },
    '@opentelemetry/instrumentation-http': {
      enabled: true,
    },
  })]
});

sdk.start();
