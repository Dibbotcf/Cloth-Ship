'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Plus, Search } from 'lucide-react';
import styles from './CategorySelect.module.css';

export default function AttributeSelect({ value, onChange, name, placeholder, apiEndpoint, defaultOptions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    
    // Fetch attributes
    fetch(apiEndpoint)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Merge API results with defaultOptions, avoiding duplicates by name
          const merged = [...options];
          
          // Map default options to the db item structure (using capitalized label as name)
          const localOpts = defaultOptions.map(opt => ({
            name: opt,
            slug: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          }));

          // Add items from API
          data.forEach(item => {
            if (!localOpts.find(o => o.name.toLowerCase() === item.name.toLowerCase())) {
              localOpts.push(item);
            }
          });
          
          setOptions(localOpts);
        } else {
          // Fallback to default options if request fails
          setOptions(defaultOptions.map(opt => ({
            name: opt,
            slug: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
          })));
        }
      })
      .catch(() => {
        setOptions(defaultOptions.map(opt => ({
          name: opt,
          slug: opt.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
        })));
      });

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [apiEndpoint]);

  // Compute display options dynamically without triggering state loops
  const displayOptions = useMemo(() => {
    const list = [...options];
    if (value && !list.find(o => o.name.toLowerCase() === value.toLowerCase())) {
      list.push({
        name: value,
        slug: value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      });
    }
    return list;
  }, [options, value]);

  const filteredOptions = displayOptions.filter(o => 
    o.name.toLowerCase().includes(search.toLowerCase())
  );

  const exactMatch = displayOptions.find(o => o.name.toLowerCase() === search.toLowerCase().trim());

  const handleSelect = (val) => {
    onChange({ target: { name, value: val } });
    setIsOpen(false);
    setSearch('');
  };

  const handleAdd = async () => {
    if (search.trim() && !exactMatch) {
      const newName = search.trim();
      const newSlug = newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const newOpt = { slug: newSlug, name: newName };
      
      setLoading(true);
      try {
        const res = await fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug: newSlug, name: newName })
        });
        if (res.ok) {
          const data = await res.json();
          setOptions(prev => [...prev, data]);
          handleSelect(data.name);
        } else {
          setOptions(prev => [...prev, newOpt]);
          handleSelect(newName);
        }
      } catch (e) {
        setOptions(prev => [...prev, newOpt]);
        handleSelect(newName);
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedLabel = displayOptions.find(o => o.name.toLowerCase() === (value || '').toLowerCase())?.name || value || placeholder;

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
              placeholder={`Search or add...`} 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
          </div>
          
          <div className={styles.list}>
            {filteredOptions.map((o, idx) => (
              <div 
                key={`${o.slug || o.name}-${idx}`} 
                className={`${styles.item} ${value?.toLowerCase() === o.name.toLowerCase() ? styles.selected : ''}`}
                onClick={() => handleSelect(o.name)}
              >
                {o.name}
              </div>
            ))}
            
            {search.trim() && !exactMatch && (
              <div className={styles.addItem} onClick={handleAdd}>
                {loading ? <span style={{ fontSize: 14 }}>⏳</span> : <Plus size={14} />} 
                {loading ? 'Adding...' : `Add "${search.trim()}"`}
              </div>
            )}
            
            {filteredOptions.length === 0 && !search.trim() && (
              <div className={styles.empty}>No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
