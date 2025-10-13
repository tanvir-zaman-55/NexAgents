import "./SearchBar.css";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

function SearchBar({ searchQuery, setSearchQuery }: SearchBarProps) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search all messages..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      {searchQuery && (
        <button className="clear-search" onClick={() => setSearchQuery("")}>
          ✕
        </button>
      )}
    </div>
  );
}

export default SearchBar;
