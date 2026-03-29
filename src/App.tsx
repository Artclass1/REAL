import { useState } from 'react';
import { AlertCircle, Loader2, ArrowRight, Mail, Building2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runAgenticSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search prompt.');
      return;
    }

    setIsSearching(true);
    setError(null);
    setResults(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `You are an expert real estate sourcing agent.
Perform a live web search based on this user request: "${searchQuery}"

CRITICAL INSTRUCTIONS:
1. EXCLUDE major aggregators (Zillow, Realtor.com, Trulia, LandWatch, LandAndFarm). Focus on independent brokerages, FSBO sites, local classifieds, or county-specific listing sites.
2. DO NOT return YouTube or Facebook links.
3. Find 3 to 5 highly relevant, real listings matching the request.
4. For each listing, provide the following format exactly:
   ### [Property Title / Location]
   - **Price:** [Price]
   - **Size:** [Size/Acreage]
   - **Contact:** [Phone, Email, or Name of Broker/Owner]
   - **Source:** [URL to the listing]
   - **Description:** [1-2 sentences summarizing the property]
   ---

Ensure you actually search the web and provide real links and contact info. Do not make up listings. If you cannot find exact matches, find the closest possible independent listings.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        }
      });

      if (response.text) {
        setResults(response.text);
      } else {
        setError('No results found. Try broadening your search.');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during the search.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-zinc-800 flex flex-col">
      <main className="max-w-3xl mx-auto px-6 py-24 flex-grow w-full">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
                <Building2 className="w-6 h-6 text-zinc-100" />
              </div>
              <h1 className="text-3xl font-light tracking-tight text-white">Agentic Real Estate Search</h1>
            </div>
            <p className="text-zinc-500 text-sm">Find off-market land, FSBOs, and direct broker listings bypassing major aggregators.</p>
          </div>

          <div className="relative">
            <textarea
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g., Find me 50 acres of land in Texas Hill Country with owner financing..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 pb-16 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 focus:border-zinc-500 resize-none min-h-[140px] transition-all"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  runAgenticSearch();
                }
              }}
            />
            <div className="absolute bottom-4 right-4">
              <button
                onClick={runAgenticSearch}
                disabled={isSearching || !searchQuery.trim()}
                className="flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black py-2 px-5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {results && !isSearching && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="markdown-body bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-8 mt-8"
              >
                <ReactMarkdown>{results}</ReactMarkdown>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      <footer className="border-t border-zinc-900 bg-black/50 backdrop-blur-sm py-8 mt-auto">
        <div className="max-w-3xl mx-auto px-6 flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-zinc-500 text-xs tracking-widest uppercase font-medium">Enterprise Sourcing Engine</p>
          <a 
            href="mailto:artclassstudio11@gmail.com" 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all text-sm"
          >
            <Mail className="w-4 h-4" />
            Acquire this project: artclassstudio11@gmail.com
          </a>
        </div>
      </footer>
    </div>
  );
}

