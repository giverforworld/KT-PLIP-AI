const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { AzureMonitorTraceExporter } = require('@azure/monitor-opentelemetry-exporter');
const { BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');

const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'be-alp'
});

const traceExporter = process.env.APPLICATIONINSIGHTS_CONNECTION_STRING ? 
  new AzureMonitorTraceExporter({
    connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING
  }) : null;

const sdk = new NodeSDK({
  resource: resource,
  spanProcessor: new BatchSpanProcessor(traceExporter),
  instrumentations: [getNodeAutoInstrumentations()]
});

sdk.start();
