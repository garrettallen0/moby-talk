interface ActionButtonsProps {
  id: string | undefined;
  name: string;
  selectedChapters: Set<number>;
  onSave: () => void;
  onCancel: () => void;
  onDelete: () => void;
  variant?: 'header' | 'bottom';
}

export function ActionButtons({ 
  id, 
  name, 
  selectedChapters, 
  onSave, 
  onCancel, 
  onDelete, 
  variant = 'header' 
}: ActionButtonsProps) {
  const isBottom = variant === 'bottom';
  
  return (
    <div className={`flex gap-2 ${isBottom ? 'w-full p-4 bg-white border-t border-gray-200' : 'w-full md:w-auto md:ml-auto'}`}>
      <button
        className={`${isBottom ? 'flex-1 px-4 py-3' : 'px-4 py-2'} bg-blue-500 text-white border-none rounded text-sm cursor-pointer transition-all duration-200 font-medium hover:bg-blue-600 disabled:bg-gray-500 disabled:cursor-not-allowed`}
        onClick={onSave}
        disabled={!name.trim() || selectedChapters.size === 0}
      >
        {id ? 'Save' : 'Create Map'}
      </button>
      <button 
        className={`${isBottom ? 'flex-1 px-4 py-3' : 'px-4 py-2'} bg-gray-100 text-gray-600 border border-gray-300 rounded text-sm cursor-pointer transition-all duration-200 font-medium hover:bg-gray-200 hover:border-gray-400`}
        onClick={onCancel}
      >
        Cancel
      </button>
      {id && (
        <button
          className={`${isBottom ? 'flex-1 px-4 py-3' : 'px-4 py-2'} bg-red-500 text-white border-none rounded text-sm cursor-pointer transition-all duration-200 font-medium hover:bg-red-600`}
          onClick={onDelete}
        >
          Delete
        </button>
      )}
    </div>
  );
} 