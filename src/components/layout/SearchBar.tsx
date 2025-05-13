
import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { useNavigate } from 'react-router-dom';

interface SearchBarProps {
  onClose: () => void;
}

const SearchBar = ({ onClose }: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const { CoursesHub } = useTourLMS();
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Focus input when component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
    
    // Add click outside handler
    const handleClickOutside = (e: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);
  
  useEffect(() => {
    if (query.length >= 2) {
      // Filter courses based on query
      const filtered = CoursesHub.filter(course => 
        course.title?.toLowerCase().includes(query.toLowerCase()) ||
        course.description?.toLowerCase().includes(query.toLowerCase()) ||
        course.category?.toLowerCase().includes(query.toLowerCase())
      );
      setResults(filtered.slice(0, 5)); // Limit to 5 results
    } else {
      setResults([]);
    }
  }, [query, CoursesHub]);
  
  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`);
    onClose();
  };
  
  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-slate-500 h-4 w-4" />
        <input
          ref={inputRef}
          type="search"
          placeholder="Search courses, topics, or resources..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-full bg-slate-50 dark:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-red-500 dark:focus:ring-red-400 focus:border-transparent transition-all"
        />
        <button 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      
      {results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50">
          {results.map((course) => (
            <div 
              key={course._id} 
              className="p-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-slate-100 dark:border-slate-700 last:border-0"
              onClick={() => handleCourseClick(course._id)}
            >
              <div className="flex items-center">
                {course.thumbnail && (
                  <img 
                    src={course.thumbnail} 
                    alt={course.title} 
                    className="w-10 h-10 object-cover rounded mr-3"
                  />
                )}
                <div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{course.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {course.category} • {course.enrolled || 0} enrolled
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
