import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Search } from 'lucide-react';
import { Department } from '../types';

interface DepartmentTreeProps {
  departments: Department[];
  selectedDepartments: string[];
  onToggleDepartment: (departmentId: string) => void;
  onSelectionChange?: (ids: string[]) => void;
}

export function DepartmentTree({
  departments,
  selectedDepartments,
  onToggleDepartment,
  onSelectionChange,
}: DepartmentTreeProps) {
  const [expandedDepartments, setExpandedDepartments] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleExpanded = (id: string) => {
    setExpandedDepartments((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const isSelected = (id: string) => selectedDepartments.includes(id);

  const getSubtreeIds = (dept: Department): string[] => {
    const ids = [dept.id];
    if (dept.children && dept.children.length > 0) {
      dept.children.forEach((child) => {
        ids.push(...getSubtreeIds(child));
      });
    }
    return ids;
  };

  const normalizeSelection = (ids: string[]): string[] => {
    const selected = new Set(ids);

    const walk = (dept: Department): boolean => {
      const hasChildren = dept.children && dept.children.length > 0;
      if (!hasChildren) {
        return selected.has(dept.id);
      }

      const allChildrenSelected = dept.children!.every((child) => walk(child));
      if (allChildrenSelected) {
        selected.add(dept.id);
      } else {
        selected.delete(dept.id);
      }

      return selected.has(dept.id);
    };

    departments.forEach((dept) => walk(dept));
    return Array.from(selected);
  };

  const updateSelection = (ids: string[]) => {
    const normalized = normalizeSelection(ids);
    if (onSelectionChange) {
      onSelectionChange(normalized);
      return;
    }
    // Fallback for older parent integrations.
    const current = new Set(selectedDepartments);
    const next = new Set(normalized);
    const changed = Array.from(new Set([...current, ...next])).filter(
      (id) => current.has(id) !== next.has(id)
    );
    changed.forEach((id) => onToggleDepartment(id));
  };

  const handleDepartmentToggle = (dept: Department) => {
    const hasChildren = dept.children && dept.children.length > 0;
    const currentlySelected = isSelected(dept.id);

    if (!hasChildren) {
      const next = currentlySelected
        ? selectedDepartments.filter((id) => id !== dept.id)
        : [...selectedDepartments, dept.id];
      updateSelection(next);
      return;
    }

    const fullDept = departmentIndex.get(dept.id) ?? dept;
    const subtreeIds = getSubtreeIds(fullDept);
    if (currentlySelected) {
      updateSelection(selectedDepartments.filter((id) => !subtreeIds.includes(id)));
    } else {
      updateSelection(Array.from(new Set([...selectedDepartments, ...subtreeIds])));
    }
  };

  // Filter logic: if a department matches OR has matching children
  const filterDepartments = (depts: Department[], query: string): Department[] => {
    if (!query) return depts;
    const lowerQuery = query.toLowerCase();

    return depts.reduce((acc: Department[], dept) => {
      const nameMatches = dept.name.toLowerCase().includes(lowerQuery);
      const filteredChildren = dept.children ? filterDepartments(dept.children, query) : [];

      if (nameMatches || filteredChildren.length > 0) {
        acc.push({
          ...dept,
          children: filteredChildren.length > 0 ? filteredChildren : dept.children
        });
      }
      return acc;
    }, []);
  };

  const filteredDepartments = useMemo(
    () => filterDepartments(departments, searchQuery),
    [departments, searchQuery]
  );

  const departmentIndex = useMemo(() => {
    const index = new Map<string, Department>();
    const walk = (depts: Department[]) => {
      depts.forEach((dept) => {
        index.set(dept.id, dept);
        if (dept.children && dept.children.length > 0) {
          walk(dept.children);
        }
      });
    };
    walk(departments);
    return index;
  }, [departments]);

  // Auto-expand if searching
  const displayedDepartments = searchQuery ? filteredDepartments : departments;
  // If searching, we act as if everything matching is expanded so users can see results inside folders
  const isAutoExpanded = !!searchQuery;

  const renderDepartment = (dept: Department, level: number = 0) => {
    const hasChildren = dept.children && dept.children.length > 0;
    // Expanded if manually expanded OR if we are searching (to show results)
    const isExpanded = expandedDepartments.includes(dept.id) || isAutoExpanded;
    const selected = isSelected(dept.id);

    return (
      <div key={dept.id}>
        <div
          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors`}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        >
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(dept.id)}
              className="p-0.5 hover:bg-secondary rounded"
              aria-label={isExpanded ? `Collapse ${dept.name}` : `Expand ${dept.name}`}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <div className="w-5" />
          )}

          {hasChildren ? (
            <>
              <button
                onClick={() => toggleExpanded(dept.id)}
                className="flex-1 text-left py-1 px-2 rounded text-foreground hover:bg-secondary/40 transition-colors"
                aria-expanded={isExpanded}
              >
                <span className="text-sm truncate" title={dept.name}>{dept.name}</span>
              </button>
              <input
                type="checkbox"
                checked={selected}
                onClick={(e) => e.stopPropagation()}
                onChange={() => handleDepartmentToggle(dept)}
                className="h-4 w-4 accent-primary cursor-pointer"
                aria-label={`Select ${dept.name}`}
              />
            </>
          ) : (
            <>
              <button
                onClick={() => handleDepartmentToggle(dept)}
                className={`flex-1 text-left text-sm truncate py-1 px-2 rounded transition-colors ${selected
                  ? 'bg-primary/20 text-primary'
                  : 'text-foreground hover:bg-secondary/40'
                  }`}
                title={dept.name}
              >
                {dept.name}
              </button>
              <input
                type="checkbox"
                checked={selected}
                onClick={(e) => e.stopPropagation()}
                onChange={() => handleDepartmentToggle(dept)}
                className="h-4 w-4 accent-primary cursor-pointer"
                aria-label={`Select ${dept.name}`}
              />
            </>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div>
            {dept.children!.map((child) => renderDepartment(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  // Helper to get all IDs recursively
  const getAllIds = (depts: Department[]): string[] => {
    return depts.reduce((acc: string[], dept) => {
      if (dept.children && dept.children.length > 0) {
        acc.push(dept.id, ...getAllIds(dept.children));
      } else {
        acc.push(dept.id);
      }
      return acc;
    }, []);
  };

  const handleSelectAll = () => {
    // If we are filtering, only select the visible filtered departments
    const idsToSelect = getAllIds(displayedDepartments);
    // Merge with existing, avoiding duplicates
    const newSelected = Array.from(new Set([...selectedDepartments, ...idsToSelect]));
    updateSelection(newSelected);
  };

  const handleDeselectAll = () => {
    updateSelection([]);
  };

  return (
    <div className="space-y-3">
      <div className="relative sticky top-0 bg-card z-10 space-y-2 pb-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            placeholder="Search departments..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSelectAll}
            className="text-xs px-2 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded transition-colors"
          >
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            className="text-xs px-2 py-1 bg-secondary text-muted-foreground hover:bg-secondary/80 rounded transition-colors"
          >
            Deselect All
          </button>
        </div>
      </div>
      <div className="space-y-1">
        {displayedDepartments.length > 0 ? (
          displayedDepartments.map((dept) => renderDepartment(dept))
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">No departments found.</p>
        )}
      </div>
    </div>
  );
}
