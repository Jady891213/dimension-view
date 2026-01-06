
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  Clock, 
  Layers, 
  Search, 
  Activity,
  Settings,
  Table as TableIcon,
  GitBranch,
  Eye,
  CheckCircle2,
  XCircle,
  Filter,
  ArrowRight,
  Edit3,
  Save,
  X,
  Check,
  Trash2,
  Download,
  Upload,
  MoreVertical,
  Network,
  Timer,
  AlertCircle,
  CalendarDays,
  Hash,
  Loader2
} from 'lucide-react';
import { INITIAL_DIMENSION_TREE, SCENARIOS, VERSIONS, YEARS, PERIODS } from './constants';
import { DimensionNode, AppContext, Scenario, Version } from './types';

// --- Utilities ---
const isNodeActiveAt = (node: DimensionNode, year: number, period: number) => {
  const { startYear, startPeriod } = node.validFrom;
  const { startYear: endYear, startPeriod: endPeriod } = node.validTo;
  const targetTotal = year * 100 + period;
  const startTotal = startYear * 100 + startPeriod;
  const endTotal = endYear * 100 + endPeriod;
  return targetTotal >= startTotal && targetTotal <= endTotal;
};

const hasAnyActiveInColumns = (node: DimensionNode, columns: { year: number; period: number }[]) => {
  if (columns.length === 0) return false;
  return columns.some(col => isNodeActiveAt(node, col.year, col.period));
};

// --- Sub-components ---

const StatusBadge: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`inline-flex items-center justify-center w-7 h-5 rounded-full text-[10px] font-bold transition-all shadow-sm ${
    active 
      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
      : 'bg-slate-100 text-slate-400 border border-slate-200'
  }`}>
    {active ? 'Y' : 'N'}
  </span>
);

const HierarchyRow: React.FC<{
  node: DimensionNode;
  depth: number;
  expandedIds: Set<string>;
  onToggleExpand: (id: string) => void;
  onSelect: (node: DimensionNode) => void;
  activeNodeId: string | null;
  columns: { year: number; period: number; label: string }[];
  onlyEffective: boolean;
}> = ({ node, depth, expandedIds, onToggleExpand, onSelect, activeNodeId, columns, onlyEffective }) => {
  const isAnyActiveInCurrentView = hasAnyActiveInColumns(node, columns);
  if (onlyEffective && !isAnyActiveInCurrentView) return null;

  const isExpanded = expandedIds.has(node.id);
  const hasChildren = node.children && node.children.length > 0;
  const isSelected = activeNodeId === node.id;

  const visibleChildren = onlyEffective 
    ? node.children.filter(child => hasAnyActiveInColumns(child, columns))
    : node.children;

  return (
    <>
      <tr 
        className={`border-b border-slate-100 group transition-all duration-200 ${
          isSelected ? 'bg-blue-50/40' : 'hover:bg-slate-50/50'
        }`}
        onClick={() => onSelect(node)}
      >
        <td 
          className={`sticky left-0 border-r border-slate-100 z-10 py-3 pr-4 transition-colors ${
            isSelected ? 'bg-blue-50/10' : 'bg-white group-hover:bg-slate-50/50'
          }`}
          style={{ paddingLeft: `${depth * 1.5 + 1.25}rem`, width: '270px', minWidth: '270px' }}
        >
          <div className="flex items-center">
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleExpand(node.id); }}
              className={`p-1 mr-2 rounded hover:bg-slate-200 transition-colors ${!hasChildren ? 'invisible' : ''}`}
            >
              {isExpanded ? (
                <ChevronDown size={14} className="text-slate-500" />
              ) : (
                <ChevronRight size={14} className="text-slate-500" />
              )}
            </button>
            <div className="flex flex-col overflow-hidden">
              <span className="text-[13px] text-slate-700 font-semibold truncate leading-tight">
                {node.code}
              </span>
              <span className="text-[11px] text-slate-400 truncate mt-0.5">
                {node.name}
              </span>
            </div>
            {isSelected && <div className="ml-auto w-1 h-4 bg-blue-500 rounded-full" />}
          </div>
        </td>

        {columns.map((col, idx) => {
          const active = isNodeActiveAt(node, col.year, col.period);
          return (
            <td key={idx} className="w-24 min-w-[6rem] border-r border-slate-100 py-3 text-center transition-colors">
              <StatusBadge active={active} />
            </td>
          );
        })}
      </tr>

      {isExpanded && visibleChildren.length > 0 && visibleChildren.map(child => (
        <HierarchyRow 
          key={child.id}
          node={child}
          depth={depth + 1}
          expandedIds={expandedIds}
          onToggleExpand={onToggleExpand}
          onSelect={onSelect}
          activeNodeId={activeNodeId}
          columns={columns}
          onlyEffective={onlyEffective}
        />
      ))}
    </>
  );
};

const MultiSelectGroup: React.FC<{
  label: string;
  options: number[];
  selected: number[];
  onChange: (vals: number[]) => void;
  icon: React.ElementType;
}> = ({ label, options, selected, onChange, icon: Icon }) => {
  const toggleOption = (val: number) => {
    if (selected.includes(val)) {
      if (selected.length > 1) {
        onChange(selected.filter(v => v !== val));
      }
    } else {
      onChange([...selected, val].sort((a, b) => a - b));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Icon size={12} className="text-slate-400" />
        <label className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">{label}</label>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {options.map(opt => {
          const isSelected = selected.includes(opt);
          return (
            <button
              key={opt}
              onClick={() => toggleOption(opt)}
              className={`py-2 text-[12px] font-medium rounded-lg border transition-all ${
                isSelected 
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300'
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default function App() {
  const [tree, setTree] = useState<DimensionNode[]>(INITIAL_DIMENSION_TREE);
  
  const [appliedContext, setAppliedContext] = useState<AppContext>({
    scenario: 'Actual',
    version: 'Working',
    years: [2024],
    periods: [1, 2, 3, 4, 5, 6]
  });

  const [workingContext, setWorkingContext] = useState<AppContext>({...appliedContext});

  const [selectedNode, setSelectedNode] = useState<DimensionNode | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(['root-1', 'node-2']));
  const [activeTab, setActiveTab] = useState<'tree' | 'table' | 'temporal'>('temporal');
  const [isEditing, setIsEditing] = useState(false);
  const [onlyEffective, setOnlyEffective] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // 执行查询：添加加载动画和延迟
  const handleExecuteQuery = () => {
    setIsLoading(true);
    // 生成 0.5s - 1.5s 之间的随机延迟
    const delay = Math.floor(Math.random() * 1000) + 500;
    
    setTimeout(() => {
      setAppliedContext({...workingContext});
      setOnlyEffective(false);
      setIsLoading(false);
    }, delay);
  };

  const columns = useMemo(() => {
    const cols: { year: number; period: number; label: string }[] = [];
    appliedContext.years.forEach(y => {
      appliedContext.periods.forEach(p => {
        cols.push({
          year: y,
          period: p,
          label: `${y}-${String(p).padStart(2, '0')}`
        });
      });
    });
    return cols.sort((a, b) => (a.year * 100 + a.period) - (b.year * 100 + b.period));
  }, [appliedContext]);

  const flattenedList = useMemo(() => {
    const list: any[] = [];
    const flatten = (nodes: DimensionNode[], parentCode: string = 'None') => {
      nodes.forEach(n => {
        list.push({ ...n, parentCode });
        if (n.children) flatten(n.children, n.code);
      });
    };
    flatten(tree);
    return list;
  }, [tree]);

  return (
    <div className="flex h-screen w-full flex-col bg-slate-50 font-sans overflow-hidden select-none">
      {/* Header */}
      <header className="flex h-14 items-center justify-between border-b border-slate-200 px-6 bg-white shadow-sm z-50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-blue-600 to-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
            <Layers size={18} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-[14px] font-bold text-slate-800 tracking-tight">维度主数据管理系统</h1>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Dimension Master AI</span>
          </div>
        </div>
        
        <nav className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
          {[
            { id: 'tree', label: '树形视图', icon: Network },
            { id: 'table', label: '表格视图', icon: TableIcon },
            { id: 'temporal', label: '时效性预览', icon: Timer }
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-1.5 text-[12px] font-semibold rounded-md transition-all ${
                activeTab === tab.id 
                  ? 'bg-white shadow-md text-blue-600' 
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
              }`}
            >
              <tab.icon size={14} /> {tab.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center text-slate-500">
            <Settings size={16} />
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-[100] flex flex-col items-center justify-center transition-all animate-in fade-in duration-300">
            <div className="bg-white p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-5 border border-slate-100">
              <div className="relative">
                <Loader2 size={48} className="text-blue-600 animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity size={18} className="text-blue-400" />
                </div>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-bold text-slate-800">正在获取维度数据...</p>
                <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-widest font-medium">Processing temporal relationships</p>
              </div>
            </div>
          </div>
        )}

        {/* Sidebar */}
        <aside className={`w-80 border-r border-slate-200 flex flex-col bg-white shadow-xl z-20 transition-opacity ${activeTab !== 'temporal' ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">查询 POV 设置</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] text-slate-500 font-bold ml-1 uppercase">业务场景</label>
                <select 
                  value={workingContext.scenario}
                  disabled={isLoading}
                  onChange={(e) => setWorkingContext({...workingContext, scenario: e.target.value as Scenario})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {SCENARIOS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] text-slate-500 font-bold ml-1 uppercase">版本选择</label>
                <select 
                  value={workingContext.version}
                  disabled={isLoading}
                  onChange={(e) => setWorkingContext({...workingContext, version: e.target.value as Version})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {VERSIONS.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="h-px bg-slate-100" />

            <div className="space-y-6">
              <MultiSelectGroup 
                label="年份多选" 
                icon={CalendarDays}
                options={YEARS} 
                selected={workingContext.years} 
                onChange={(years) => setWorkingContext({...workingContext, years})} 
              />
              <MultiSelectGroup 
                label="期间多选" 
                icon={Hash}
                options={PERIODS} 
                selected={workingContext.periods} 
                onChange={(periods) => setWorkingContext({...workingContext, periods})} 
              />
            </div>
          </div>

          <div className="p-5 border-t border-slate-100 bg-slate-50/50">
            <button 
              onClick={handleExecuteQuery}
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-[14px] font-bold transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.97] ${
                isLoading 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-200'
              }`}
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18}/>}
              {isLoading ? '查询中...' : '执行查询'}
            </button>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative">
          {activeTab !== 'temporal' ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-5">
              <div className="p-8 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                {activeTab === 'tree' ? <Network size={64} className="opacity-50" /> : <TableIcon size={64} className="opacity-50" />}
              </div>
              <div className="text-center">
                <p className="text-[15px] font-semibold text-slate-500">此视图正在构建中</p>
                <p className="text-[12px] text-slate-400 mt-1">请切换至“时效性预览”进行核心功能测试</p>
              </div>
            </div>
          ) : (
            <>
              {/* Action Bar */}
              <div className="h-16 px-6 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30">
                <div className="flex items-center gap-4">
                  <div className={`px-2 py-1 rounded bg-slate-100 text-[10px] font-bold tracking-widest ${isEditing ? 'text-orange-500' : 'text-blue-500'}`}>
                    {isEditing ? 'EDITING MODE' : 'PREVIEW MODE'}
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-800">
                    {isEditing ? '层级关系批量维护' : '多维实体时效性报表'}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  {!isEditing ? (
                    <>
                      <button 
                        onClick={() => setOnlyEffective(!onlyEffective)}
                        disabled={isLoading}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold border-2 transition-all ${
                          onlyEffective 
                            ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' 
                            : 'bg-white border-slate-200 text-slate-500 hover:border-blue-500 hover:text-blue-500'
                        } disabled:opacity-50`}
                        title={onlyEffective ? "当前仅显示在查询列中有生效记录的节点" : "当前显示所有层级节点"}
                      >
                        <Eye size={15} /> {onlyEffective ? '仅看有效关系' : '显示所有关系'}
                      </button>
                      <button 
                        onClick={() => setIsEditing(true)}
                        disabled={isLoading}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-bold bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-lg active:scale-[0.96] disabled:opacity-50"
                      >
                        <Edit3 size={15} /> 进入编辑
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[12px] font-bold text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all">
                        <Trash2 size={15}/> 移除行
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] font-bold border border-slate-200 text-slate-500 hover:bg-slate-50"
                      >
                        取消修改
                      </button>
                      <button 
                        onClick={() => setIsEditing(false)}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[12px] font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
                      >
                        <Save size={15} /> 提交更改
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* View Content */}
              <div className="flex-1 overflow-auto custom-scrollbar bg-slate-50/30 p-8">
                {!isEditing ? (
                  <div className="w-fit mx-auto min-w-[1200px]">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse table-fixed">
                        <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-30">
                          <tr>
                            <th className="sticky left-0 bg-slate-50 border-r border-slate-200 z-40 p-5 text-[11px] font-bold text-slate-500 uppercase tracking-widest" style={{ width: '270px' }}>
                              实体层级 (代码与名称)
                            </th>
                            {columns.map((col, idx) => (
                              <th key={idx} className="p-4 text-[11px] font-bold text-blue-600 text-center border-r border-slate-200 w-24">
                                {col.label}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className={`${isLoading ? 'opacity-20 pointer-events-none' : 'opacity-100'} transition-opacity duration-300`}>
                          <tr className="bg-blue-50/20">
                            <td className="sticky left-0 bg-blue-50/50 backdrop-blur-sm border-r border-slate-200 p-4 text-[13px] font-bold text-blue-900" style={{ width: '270px' }}>
                              <div className="flex items-center gap-2">
                                <Activity size={14} className="text-blue-500" />
                                默认组织视图 (DEFAULT_ORG)
                              </div>
                            </td>
                            {columns.map((_, idx) => <td key={idx} className="border-r border-slate-200"></td>)}
                          </tr>
                          {tree.map(node => (
                            <HierarchyRow 
                              key={node.id}
                              node={node}
                              depth={0}
                              expandedIds={expandedIds}
                              onToggleExpand={toggleExpand}
                              onSelect={setSelectedNode}
                              activeNodeId={selectedNode?.id || null}
                              columns={columns}
                              onlyEffective={onlyEffective}
                            />
                          ))}
                        </tbody>
                      </table>
                      {!isLoading && onlyEffective && tree.every(n => !hasAnyActiveInColumns(n, columns)) && (
                        <div className="flex flex-col items-center justify-center p-20 text-slate-400 gap-3">
                          <AlertCircle size={40} className="opacity-20" />
                          <p className="text-[13px] font-medium">在当前查询期间内未发现任何有效的实体关系</p>
                          <p className="text-[11px] opacity-60">请尝试调整 POV 设置或切换至“显示所有关系”</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[1600px] mx-auto">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-900 border-b border-slate-800">
                          <tr>
                            <th className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-12">#</th>
                            {['Member Name', 'Parent Name', 'Year', 'Period', 'Scenario', 'Version', 'Status'].map(h => (
                              <th key={h} className="p-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                <div className="flex items-center gap-1.5">{h} <Filter size={11} className="opacity-30"/></div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {flattenedList.map((row, idx) => (
                            <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="p-4 text-[11px] text-slate-400 text-center font-mono">{String(idx + 1).padStart(2, '0')}</td>
                              <td className="p-4">
                                <div className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-700 bg-white group hover:border-blue-400 transition-all cursor-pointer">
                                  <span className="font-semibold">{row.code}</span>
                                  <ChevronDown size={14} className="text-slate-300"/>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-700 bg-white group hover:border-blue-400 transition-all cursor-pointer">
                                  {row.parentCode} <ChevronDown size={14} className="text-slate-300"/>
                                </div>
                              </td>
                              {['2024', '1', 'Actual', 'Working'].map((val, i) => (
                                <td key={i} className="p-4">
                                  <div className="flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-600 bg-slate-50/50">
                                    {val} <ChevronDown size={14} className="text-slate-300 opacity-0"/>
                                  </div>
                                </td>
                              ))}
                              <td className="p-4 text-center">
                                <StatusBadge active={isNodeActiveAt(row, appliedContext.years[0], appliedContext.periods[0])} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
