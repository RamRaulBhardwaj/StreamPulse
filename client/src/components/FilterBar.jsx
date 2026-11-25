const categories = [
  'All',
  'Tech',
  'Education',
  'Gaming',
  'Music',
  'Entertainment',
  'News',
  'Other'
];

export const FilterBar = ({ selectedCategory, onSelectCategory, selectedSort, onSelectSort }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-2 border-b border-slate-800/80">
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
        {categories.map((category) => {
          const isActive =
            category === 'All' ? !selectedCategory || selectedCategory === 'All' : selectedCategory === category;
          return (
            <button
              key={category}
              onClick={() => onSelectCategory(category)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* Sort Dropdown */}
      <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
        <label htmlFor="sort-select" className="text-xs text-slate-400 font-medium">
          Sort by:
        </label>
        <select
          id="sort-select"
          value={selectedSort || 'newest'}
          onChange={(e) => onSelectSort(e.target.value)}
          className="bg-slate-900 text-slate-200 border border-slate-800 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-brand-500"
        >
          <option value="newest">Newest Uploads</option>
          <option value="views">Most Viewed</option>
          <option value="popular">Most Liked</option>
          <option value="oldest">Oldest Uploads</option>
        </select>
      </div>
    </div>
  );
};
