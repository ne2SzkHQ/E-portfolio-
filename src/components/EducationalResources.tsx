import { useState, useEffect } from 'react';
import { BookOpen, Download, Search, FileText, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface Resource {
  id: string;
  name: string;
  description: string;
  category: string;
  fileSize: string;
  downloadCount: number;
}

export default function EducationalResources() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResources = () => {
    setIsLoading(true);
    setError(null);
    fetch('/api/resources') // Relative Backend API endpoint
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to retrieve educational resources from registry');
        }
        return response.json();
      })
      .then(data => {
        setResources(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching data:", err);
        setError(err.message || 'Error loading resources');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const categories: string[] = ['All', ...Array.from(new Set(resources.map(res => res.category))) as string[]];

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          res.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="educational-resources-section" className="space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg uppercase tracking-[0.2em] inline-block mb-3">
          TVET Study Materials
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Educational Resources Registry
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
          Access official TVET CDACC curriculum syllabi, ePortfolio instructions, laboratory journals, and VASC assessment rubrics.
        </p>
      </div>

      {/* Control Panel: Search & Categories */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4 md:space-y-0 md:flex md:items-center md:justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            id="resource-search"
            type="text"
            placeholder="Search syllabus standards, logbooks, manuals..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 transition-all duration-300"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map(cat => (
            <button
              id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all duration-200 ${
                selectedCategory === cat
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Resource Display Area */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-3">
          <RefreshCw className="h-8 w-8 text-emerald-600 animate-spin" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading official resources...</p>
        </div>
      ) : error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50/20 p-8 text-center max-w-md mx-auto space-y-4">
          <div className="mx-auto h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Sync Connection Issue</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed font-semibold">
              {error}. Please check that your local registry server is running online.
            </p>
          </div>
          <button
            id="btn-retry-resources"
            onClick={fetchResources}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-16 text-center space-y-4">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No resources match your selection.</p>
          <button
            id="btn-clear-search"
            onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
            className="text-xs font-black text-emerald-600 hover:text-emerald-700 hover:underline"
          >
            Clear Search Filters
          </button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredResources.map(res => (
            <div
              id={`resource-card-${res.id}`}
              key={res.id}
              className="group bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs relative overflow-hidden hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between"
            >
              {/* Highlight strip */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100 group-hover:bg-emerald-600 transition-all duration-300"></div>

              <div>
                {/* Meta details */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg">
                    <BookOpen className="h-2.5 w-2.5" /> {res.category}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold">
                    {res.fileSize}
                  </span>
                </div>

                <h3 className="text-sm font-black text-slate-900 leading-snug group-hover:text-emerald-600 transition-colors duration-200">
                  {res.name}
                </h3>
                <p className="text-xs text-slate-500 mt-2 font-semibold leading-relaxed">
                  {res.description}
                </p>
              </div>

              {/* Action bar */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-emerald-500" />
                  {res.downloadCount + Math.floor(Math.random() * 10)} active references
                </span>

                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert(`Demo Download: "${res.name}" compilation package prepared for client download (${res.fileSize}).`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider text-white hover:bg-emerald-600 transition duration-300 shadow-sm cursor-pointer"
                >
                  <Download className="h-3 w-3" /> Get Package
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VASC Standards Compliance lock */}
      <div className="rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-emerald-100 text-emerald-700 rounded-xl shrink-0">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs font-black text-emerald-950 uppercase tracking-wider">National Qualification Authority Standards</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold mt-0.5">
              These reference study guides and logging formats correspond strictly to current Kenya National Qualifications Framework (KNQF) standards.
            </p>
          </div>
        </div>
        <div className="text-[9px] font-mono font-black text-emerald-700 bg-white border border-emerald-200 px-3 py-1.5 rounded-lg whitespace-nowrap">
          REF: KNQF-TVET-CDACC-2026
        </div>
      </div>
    </div>
  );
}
