/**
 * Sidebar - Action Definitions Palette
 * Users drag actions from here onto the canvas
 */

import { useState } from 'react';
import { Search } from 'lucide-react';
import useActionsStore from '../../store/actionsStore.js';

const Sidebar = ({ onDragStart }) => {
  const { actions, categories } = useActionsStore();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredActions = actions.filter(action => {
    const matchesCategory = !selectedCategory || action.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      action.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleDragStart = (event, action) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify({
      type: 'actionNode',
      actionId: action._id,
      actionName: action.name,
      category: action.category,
      logo: action.logo,
      inputSchema: action.inputSchema,
    }));
    event.dataTransfer.effectAllowed = 'move';
    
    if (onDragStart) {
      onDragStart(action);
    }
  };

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-primary text-white">
        <h2 className="text-lg font-semibold">Actions</h2>
        <p className="text-sm text-gray-200">Drag actions to the canvas</p>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search actions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="p-4 border-b border-gray-200">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Actions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {filteredActions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center">No actions found</p>
        ) : (
          <div className="space-y-2">
            {filteredActions.map(action => (
              <div
                key={action._id}
                draggable
                onDragStart={(e) => handleDragStart(e, action)}
                className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200 cursor-move hover:bg-gray-100 hover:border-primary transition-colors"
              >
                {action.logo && (
                  <img 
                    src={action.logo} 
                    alt={action.name}
                    className="w-8 h-8 mr-3 rounded"
                    onError={(e) => e.target.style.display = 'none'}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {action.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {action.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
