/**
 * CustomNode - React Flow Node Component
 * Displays action nodes on the canvas
 */

import { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Settings } from 'lucide-react';

const CustomNode = ({ data, selected }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border-2 ${selected ? 'border-primary' : 'border-gray-300'} min-w-[200px]`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 !bg-primary" />
      
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {data.logo && (
              <img 
                src={data.logo} 
                alt={data.actionName}
                className="w-6 h-6 rounded flex-shrink-0"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {data.actionName || 'Unnamed Action'}
              </div>
              <div className="text-xs text-gray-500">
                {data.category || 'Uncategorized'}
              </div>
            </div>
          </div>
          
          {data.onSettings && (
            <button
              onClick={() => data.onSettings(data)}
              className="ml-2 p-1 text-gray-400 hover:text-primary transition-colors"
            >
              <Settings size={16} />
            </button>
          )}
        </div>
        
        {data.inputs && Object.keys(data.inputs).length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              Configured ({Object.keys(data.inputs).length} inputs)
            </div>
          </div>
        )}
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 !bg-primary" />
    </div>
  );
};

export default memo(CustomNode);
