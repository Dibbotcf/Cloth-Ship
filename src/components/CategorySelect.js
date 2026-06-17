'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Search } from 'lucide-react';
import styles from './CategorySelect.module.css';

export default function CategorySelect({ value, onChange, defaultCategories }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState(defaultCategories);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    
    // Fetch categories
    fetch('/api/admin/categories')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Merge API categories with defaultCategories, avoiding duplicates by value
          const apiCats = data.map(d => ({ value: d.slug, label: d.name }));
          const merged = [...defaultCategories];
          apiCats.forEach(ac => {
            if (!merged.find(mc => mc.value === ac.value)) merged.push(ac);
          });
          setCategories(merged);
        }
      })
      .catch(console.error);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Ensure an initial or incoming external value is part of our local options list
  useEffect(() => {
    if (value && !categories.find(c => c.value === value)) {
      const label = value.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      setCategories(prev => [...prev, { value, label }]);
    }
  }, [value, categories]);

  const filteredCategories = categories.filter(c => 
    c.label.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = categories.find(c => c.label.toLowerCase() === search.toLowerCase().trim());

  const handleSelect = (val) => {
    onChange({ target: { name: 'category', value: val } });
    setIsOpen(false);
    setSearch('');
  };

  const handleAdd = async () => {
    if (search.trim() && !exactMatch) {
      const newVal = search.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newLabel = search.trim();
      const newCat = { value: newVal, label: newLabel };
      
      setLoading(true);
      try {
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: newVal, name: newLabel })
        });
        if (res.ok) {
          setCategories(prev => [...prev, newCat]);
          handleSelect(newVal);
        } else {
          // Fallback if network fails
          setCategories(prev => [...prev, newCat]);
          handleSelect(newVal);
        }
      } catch (e) {
        setCategories(prev => [...prev, newCat]);
        handleSelect(newVal);
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedLabel = categories.find(c => c.value === value)?.label || 'Select Category...';

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <div 
        className={styles.trigger} 
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{selectedLabel}</span>
        <ChevronDown size={16} color="#8c8278" />
      </div>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.searchBox}>
            <Search size={14} className={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search or add..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>
          
          <div className={styles.list}>
            {filteredCategories.map(c => (
              <div 
                key={c.value} 
                className={`${styles.item} ${value === c.value ? styles.selected : ''}`}
                onClick={() => handleSelect(c.value)}
              >
                {c.label}
              </div>
            ))}
            
            {search.trim() && !exactMatch && (
              <div className={styles.addItem} onClick={handleAdd}>
                {loading ? <span style={{ fontSize: 14 }}>⏳</span> : <Plus size={14} />} 
                {loading ? 'Adding...' : `Add "${search.trim()}"`}
              </div>
            )}
            
            {filteredCategories.length === 0 && !search.trim() && (
              <div className={styles.empty}>No categories found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
