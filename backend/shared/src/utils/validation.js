import validator from 'validator';

export function isValidEmail(email) {
  return validator.isEmail(email);
}

export function isValidURL(url) {
  return validator.isURL(url);
}

export function isValidJSON(str) {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
}

export function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return validator.escape(input);
}

export function validateWorkflowNode(node) {
  const errors = [];
  
  if (!node.id) errors.push('Node ID is required');
  if (!node.type) errors.push('Node type is required');
  if (!node.position) errors.push('Node position is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateWorkflowEdge(edge) {
  const errors = [];
  
  if (!edge.id) errors.push('Edge ID is required');
  if (!edge.source) errors.push('Edge source is required');
  if (!edge.target) errors.push('Edge target is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function validateWorkflow(workflow) {
  const errors = [];
  
  if (!workflow.name) errors.push('Workflow name is required');
  if (!workflow.organizationId) errors.push('Organization ID is required');
  
  if (workflow.nodes && Array.isArray(workflow.nodes)) {
    workflow.nodes.forEach((node, index) => {
      const nodeValidation = validateWorkflowNode(node);
      if (!nodeValidation.isValid) {
        errors.push(`Node ${index}: ${nodeValidation.errors.join(', ')}`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
