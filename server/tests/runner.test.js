/**
 * Tests for Workflow Runner Engine
 */

import workflowRunner from '../src/engine/runner.js';

describe('WorkflowRunner', () => {
  describe('substituteVariables', () => {
    it('should replace input variables', () => {
      const template = 'Hello {{input.name}}!';
      const userInputs = { name: 'World' };
      const result = workflowRunner.substituteVariables(template, userInputs, {});
      
      expect(result).toBe('Hello World!');
    });

    it('should replace multiple input variables', () => {
      const template = '{{input.greeting}} {{input.name}}!';
      const userInputs = { greeting: 'Hello', name: 'World' };
      const result = workflowRunner.substituteVariables(template, userInputs, {});
      
      expect(result).toBe('Hello World!');
    });

    it('should handle nested values from previous results', () => {
      const template = '{{$json.step1.data.userId}}';
      const previousResults = {
        step1: { data: { userId: '12345' } }
      };
      const result = workflowRunner.substituteVariables(template, {}, previousResults);
      
      expect(result).toBe('12345');
    });

    it('should keep template unchanged if variable not found', () => {
      const template = '{{input.missing}}';
      const result = workflowRunner.substituteVariables(template, {}, {});
      
      expect(result).toBe('{{input.missing}}');
    });
  });

  describe('getNestedValue', () => {
    it('should get nested value using dot notation', () => {
      const obj = { user: { profile: { name: 'John' } } };
      const result = workflowRunner.getNestedValue(obj, 'user.profile.name');
      
      expect(result).toBe('John');
    });

    it('should return undefined for missing path', () => {
      const obj = { user: { profile: { name: 'John' } } };
      const result = workflowRunner.getNestedValue(obj, 'user.missing.field');
      
      expect(result).toBeUndefined();
    });
  });

  describe('buildRequestBody', () => {
    it('should substitute variables in request body', () => {
      const template = { message: '{{input.text}}', channel: '{{input.channel}}' };
      const userInputs = { text: 'Hello', channel: '#general' };
      const result = workflowRunner.buildRequestBody(template, userInputs, {});
      
      expect(result).toEqual({ message: 'Hello', channel: '#general' });
    });

    it('should use userInputs directly if template is empty', () => {
      const template = {};
      const userInputs = { field1: 'value1', field2: 'value2' };
      const result = workflowRunner.buildRequestBody(template, userInputs, {});
      
      expect(result).toEqual(userInputs);
    });
  });
});
