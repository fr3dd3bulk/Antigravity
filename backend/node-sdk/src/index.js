export { BaseNode } from './BaseNode.js';
export { TriggerNode } from './TriggerNode.js';
export { ActionNode } from './ActionNode.js';

export * from './nodes/triggers/index.js';
export * from './nodes/actions/index.js';
export * from './nodes/conditions/index.js';
export * from './nodes/utilities/index.js';
export * from './nodes/ai/index.js';

export const ALL_NODES = [
  'WebhookTrigger',
  'CronTrigger',
  'ManualTrigger',
  'ScheduleTrigger',
  'EventTrigger',
  'HttpRequest',
  'SendEmail',
  'SendSMS',
  'DatabaseQuery',
  'Delay',
  'SetData',
  'IfCondition',
  'SwitchNode',
  'SplitNode',
  'MergeNode',
  'LoopNode',
  'JavaScriptNode',
  'JsonParser',
  'Formatter',
  'TextSummarize',
  'ContentGenerate'
];
