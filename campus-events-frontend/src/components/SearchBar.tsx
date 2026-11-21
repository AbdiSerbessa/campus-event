"use client";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="field search-bar">
      <label htmlFor="title-search">Search by title</label>
      <input
        id="title-search"
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. Cloud Computing"
        autoComplete="off"
      />
    </div>
  );
}
