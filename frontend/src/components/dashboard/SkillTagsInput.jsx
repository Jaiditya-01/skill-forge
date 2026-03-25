import { useState } from 'react';
import { X, Plus } from 'lucide-react';

const SkillTagsInput = ({ label, tags, onChange, placeholder = "Add skill..." }) => {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      // Prevent duplicates
      if (!tags.includes(inputValue.trim())) {
        onChange([...tags, inputValue.trim()]);
      }
      setInputValue('');
    }
  };

  const removeTag = (tagToRemove) => {
    onChange(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[38px] p-2 bg-white/5 border border-white/10 rounded-lg">
        {tags.map((tag, idx) => (
          <span 
            key={idx} 
            className="flex items-center px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30"
          >
            {tag}
            <button 
              type="button"
              onClick={() => removeTag(tag)}
              className="ml-1 hover:text-white transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input 
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Add more..."}
          className="bg-transparent border-none outline-none text-sm text-gray-200 flex-grow min-w-[100px]"
        />
      </div>
      <p className="text-xs text-gray-500 uppercase tracking-wider">Press Enter to add</p>
    </div>
  );
};

export default SkillTagsInput;
