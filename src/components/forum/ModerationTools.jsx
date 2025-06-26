// ModerationTools.jsx
import React, { useState } from 'react';
import { forumCategories } from '../../data/forumData';

// Required env: VITE_AVATAR_URL
const AVATAR_URL = import.meta.env.VITE_AVATAR_URL || 'https://ui-avatars.com/api/';

const ModerationTools = ({ thread, onModerate }) => {
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(thread.categoryId);

  const handleSubmit = () => {
    if (action) {
      onModerate({
        action,
        reason,
        ...(action === 'MOVE' && { newCategoryId: selectedCategory })
      });
      setAction('');
      setReason('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
      <h3 className="font-bold text-lg mb-3">Moderation Tools</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">Select action</option>
            <option value="PIN">Pin Thread</option>
            <option value="UNPIN">Unpin Thread</option>
            <option value="FEATURE">Feature Thread</option>
            <option value="CLOSE">Close Thread</option>
            <option value="MOVE">Move Thread</option>
          </select>
        </div>

        {action === 'MOVE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            >
              {forumCategories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (optional)</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Briefly explain the reason for this action..."
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!action}
          className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Apply Action
        </button>
      </div>
    </div>
  );
};

export default ModerationTools;