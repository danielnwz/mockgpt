import { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Check, Search } from 'lucide-react';
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
          className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-accent transition-colors cursor-pointer`}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
        >
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(dept.id)}
              className="p-0.5 hover:bg-secondary rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}

          <button
            onClick={() => onToggleDepartment(dept.id)}
            className={`flex-1 flex items-center justify-between text-left py-1 px-2 rounded transition-colors ${selected
              ? 'bg-primary/20 text-primary'
              : 'text-foreground'
              }`}
          >
            <span className="text-sm truncate" title={dept.name}>{dept.name}</span>
            {selected && <Check className="w-4 h-4 flex-shrink-0" />}
          </button>
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
      acc.push(dept.id);
      if (dept.children) {
        acc.push(...getAllIds(dept.children));
      }
      return acc;
    }, []);
  };

  const handleSelectAll = () => {
    // If we are filtering, only select the filtered ones
    const idsToSelect = getAllIds(displayedDepartments);
    // Merge with existing, avoiding duplicates
    const newSelected = Array.from(new Set([...selectedDepartments, ...idsToSelect]));

    // We can't batch update via onToggleDepartment parent prop easily if it expects single ID (usually). 
    // Wait, the parent `onToggleDepartment` usually toggles ONE. 
    // We need a new prop `onSelectAll` or change the interface to `onSelectionChange`.
    // Since I can't change the interface without breaking parent usage (though I will change parent next), 
    // I should probably temporarily accept that I need to update the parent interface.
    // However, looking at the tools available, I can modify the parent `AssistantEditor` in the next step.
    // For now, let's assume I'll update the prop in this file and I will fix the parent in the next step.
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    }
  };

  const handleDeselectAll = () => {
    if (onSelectionChange) {
      onSelectionChange([]);
    }
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
