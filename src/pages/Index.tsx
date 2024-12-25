import { useState, useEffect } from 'react';
import { Search, ArrowLeft, X } from 'lucide-react';
import StarryBackground from '../components/StarryBackground';
import Settings from '../components/Settings';
import MediaDetails from '../components/MediaDetails';
import PasswordAuth from '../components/PasswordAuth';
import MediaNavigation from '../components/MediaNavigation';
import { Button } from '@/components/ui/button';
import { filterCategory, fetchTVSeries, fetchTVSeriesByCategory, handleSearch, fetchMovies } from '../utils/mediaUtils';
import { determineMediaType } from '../utils/mediaTypeUtils';

interface Movie {
  id: string;
  title?: string;
  name?: string;
  poster_path: string;
  media_type?: string;
  first_air_date?: string;
  number_of_seasons?: number;
  episode_run_time?: number[];
}

const Index = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isDyslexicFont, setIsDyslexicFont] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [selectedMediaDetails, setSelectedMediaDetails] = useState<any | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [page, setPage] = useState(1);
  const [showPlayer, setShowPlayer] = useState(false);
  const [totalPages, setTotalPages] = useState(1);

  const apiKey = '650ff50a48a7379fd245c173ad422ff8';

  const categories = {
    '28': 'Action',
    '12': 'Adventure',
    '16': 'Animation',
    '35': 'Comedy',
    '80': 'Crime',
    '99': 'Documentary',
    '18': 'Drama',
    '10751': 'Family',
    '14': 'Fantasy',
    '36': 'History',
    '27': 'Horror',
    '10402': 'Music',
    '9648': 'Mystery',
    '10749': 'Romance',
    '878': 'Science Fiction',
    '10770': 'TV Movie',
    '53': 'Thriller',
    '10752': 'War',
    '37': 'Western'
  };

  const seriesCategories = {
    '10759': 'Action & Adventure',
    '16': 'Animation',
    '35': 'Comedy',
    '80': 'Crime',
    '99': 'Documentary',
    '18': 'Drama',
    '10751': 'Family',
    '10762': 'Kids',
    '9648': 'Mystery',
    '10763': 'News',
    '10764': 'Reality',
    '10765': 'Sci-Fi & Fantasy',
    '10766': 'Soap',
    '10767': 'Talk',
    '10768': 'War & Politics',
    '37': 'Western'
  };

  useEffect(() => {
    const auth = localStorage.getItem('isAuthenticated');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
    showAllCategories();
    loadInitialMovies();
  }, []);

  const loadInitialMovies = async () => {
    const { results, total_pages } = await fetchMovies(1);
    setMovies(results);
    setTotalPages(total_pages);
    setPage(1);
  };

  const showAllCategories = async () => {
    const { results, total_pages } = await fetchMovies(1);
    setMovies(results);
    setTotalPages(total_pages);
    setPage(1);
  };

  const handleFilterCategory = async (categoryId: string) => {
    const results = await filterCategory(categoryId);
    setMovies(results);
    setPage(1);
  };

  const handleFetchTVSeries = async () => {
    const results = await fetchTVSeries();
    setMovies(results);
    setPage(1);
  };

  const handleFetchTVSeriesByCategory = async (categoryId: string) => {
    const results = await fetchTVSeriesByCategory(categoryId);
    setMovies(results);
    setPage(1);
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    if (nextPage <= totalPages) {
      const { results } = await fetchMovies(nextPage);
      setMovies(prevMovies => [...prevMovies, ...results]);
      setPage(nextPage);
    }
  };

  const handleSearchQuery = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const results = await handleSearch(query);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleMediaClick = async (media: Movie) => {
    setSelectedMedia(media);
    const mediaType = determineMediaType(media);
    
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${media.id}?api_key=${apiKey}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const details = await response.json();
      details.media_type = mediaType;
      setSelectedMediaDetails(details);
    } catch (error) {
      console.error('Error fetching media details:', error);
      setSelectedMedia(null);
      setSelectedMediaDetails(null);
    }
  };

  const closePlayer = () => {
    setShowPlayer(false);
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      videoContainer.innerHTML = '';
    }
  };

  const playMedia = (id: string, type: string) => {
    const url = type === 'movie' 
      ? `https://vidsrc.me/embed/movie?tmdb=${id}` 
      : `https://vidsrc.me/embed/tv?tmdb=${id}`;
    
    const iframe = document.createElement('iframe');
    iframe.src = url;
    iframe.style.width = '100%';
    iframe.style.height = '600px';
    iframe.frameBorder = '0';
    iframe.allowFullscreen = true;

    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      videoContainer.innerHTML = '';
      videoContainer.appendChild(iframe);
      setShowPlayer(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };

  const toggleDyslexicFont = () => {
    setIsDyslexicFont(!isDyslexicFont);
  };

  const handleEpisodeSelect = (seasonNum: number, episodeNum: number) => {
    if (selectedMedia) {
      playMedia(selectedMedia.id, 'tv');
    }
  };

  if (!isAuthenticated) {
    return <PasswordAuth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#141414] text-white relative select-none">
      <StarryBackground />
      
      <header className="fixed top-0 left-0 right-0 z-50 bg-[rgba(20,20,20,0.95)] backdrop-blur-md shadow-lg shadow-black/50 border-b border-[#2a2a2a]">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold text-[#ea384c]">iHub</span>
          </div>
          
          <nav className="flex-1 mx-8">
            <MediaNavigation
              categories={categories}
              seriesCategories={seriesCategories}
              onShowAll={showAllCategories}
              onFilterCategory={handleFilterCategory}
              onFetchTVSeries={handleFetchTVSeries}
              onFetchTVSeriesByCategory={handleFetchTVSeriesByCategory}
            />
          </nav>

          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 rounded-full hover:bg-[rgba(234,56,76,0.1)] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <Settings
              currentLanguage={currentLanguage}
              isDyslexicFont={isDyslexicFont}
              onLanguageChange={handleLanguageChange}
              onToggleDyslexicFont={toggleDyslexicFont}
            />
          </div>
        </div>
      </header>

      <main className="container mx-auto pt-20 relative z-10">
        <div id="video-container" className="mb-8 relative">
          {showPlayer && (
            <Button
              onClick={closePlayer}
              className="absolute top-4 right-4 bg-[#ea384c] hover:bg-[#ff4d63] z-20"
            >
              <X className="w-4 h-4 mr-2" />
              Close Player
            </Button>
          )}
        </div>
        
        {selectedMediaDetails && (
          <MediaDetails
            id={selectedMedia.id}
            title={selectedMediaDetails.title || selectedMediaDetails.name}
            overview={selectedMediaDetails.overview}
            rating={selectedMediaDetails.vote_average}
            posterPath={selectedMediaDetails.poster_path}
            mediaType={selectedMedia.media_type || 'movie'}
            onBack={() => {
              setSelectedMedia(null);
              setSelectedMediaDetails(null);
            }}
            onSelectEpisode={handleEpisodeSelect}
          />
        )}

        {showSearch && (
          <div className="fixed inset-0 bg-[#141414]/95 z-50 p-4 overflow-y-auto">
            <div className="max-w-5xl mx-auto pt-20">
              <div className="flex items-center gap-4 mb-6">
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearchQuery('');
                    setSearchResults([]);
                  }}
                  className="p-2 rounded-full hover:bg-[rgba(234,56,76,0.1)] transition-colors text-[#ea384c]"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    handleSearchQuery(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }
                  }}
                  placeholder="Search movies and TV shows..."
                  className="w-full p-4 bg-[#2a2a2a] rounded-lg text-white placeholder:text-white/50 border-none outline-none select-text"
                  autoFocus
                />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-8 pb-20 animate-fade-in">
                {searchResults.map((result) => (
                  <div 
                    key={result.id}
                    className="relative group transition-transform duration-300 hover:scale-105 cursor-pointer animate-fade-in aspect-[2/3]"
                    onClick={() => {
                      handleMediaClick(result);
                      setShowSearch(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    }}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500${result.poster_path}`}
                      alt={result.title || result.name}
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent 
                                  opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="absolute bottom-2 left-2 right-2 text-center text-white text-sm">
                        {result.title || result.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-fade-in">
          {movies.map((movie, index) => (
            <div 
              key={`${movie.id}-${index}`}
              className="relative group transition-all duration-300 hover:scale-110 animate-fade-in aspect-[2/3]"
              style={{
                animationDelay: `${index * 50}ms`
              }}
              onClick={() => handleMediaClick(movie)}
            >
              <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title || movie.name}
                className="w-full h-full object-cover rounded-lg shadow-[0_0_15px_rgba(234,56,76,0.3)] 
                         transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(234,56,76,0.5)]"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent 
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300
                            rounded-lg">
                <p className="absolute bottom-2 left-2 right-2 text-center text-white text-sm
                            font-medium">
                  {movie.title || movie.name}
                </p>
              </div>
            </div>
          ))}
        </div>

        {movies.length > 0 && page < totalPages && (
          <div className="flex justify-center mt-8 mb-12">
            <Button
              onClick={loadMore}
              className="bg-[#ea384c] hover:bg-[#ff4d63]"
            >
              Load More
            </Button>
          </div>
        )}
      </main>

      <footer className="mt-8 pb-12 text-center text-sm text-gray-400">
        <p className="font-medium">
          © Copyright {new Date().getFullYear()} by{' '}
          <span className="text-[#ea384c] hover:text-[#ff4d63] transition-colors duration-300">
            Oz
          </span>
        </p>
      </footer>
    </div>
  );
};

export default Index;