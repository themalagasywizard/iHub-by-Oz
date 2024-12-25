import React from 'react';
import { ArrowLeft, Star, Play } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { determineMediaType } from '../utils/mediaTypeUtils';

interface MediaDetailsProps {
  id: string;
  title: string;
  overview: string;
  rating: number;
  posterPath: string;
  mediaType: 'movie' | 'tv';
  onBack: () => void;
  onSelectEpisode?: (seasonNum: number, episodeNum: number) => void;
}

const MediaDetails = ({ 
  id, 
  title, 
  overview, 
  rating, 
  posterPath,
  mediaType,
  onBack,
  onSelectEpisode 
}: MediaDetailsProps) => {
  const [seasons, setSeasons] = React.useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = React.useState<number | null>(null);
  const [episodes, setEpisodes] = React.useState<any[]>([]);
  const apiKey = '650ff50a48a7379fd245c173ad422ff8';

  React.useEffect(() => {
    const fetchSeasons = async () => {
      try {
        // Force a TV show check using our utility
        const response = await fetch(`https://api.themoviedb.org/3/tv/${id}?api_key=${apiKey}`);
        const data = await response.json();
        
        // If we get valid seasons data, it's definitely a TV show
        if (data.seasons && data.seasons.length > 0) {
          setSeasons(data.seasons);
          handleSeasonSelect(data.seasons[0].season_number);
        }
      } catch (error) {
        console.error('Error fetching seasons:', error);
        setSeasons([]);
      }
    };

    // Always attempt to fetch seasons - if it fails, it's likely a movie
    fetchSeasons();
  }, [id]);

  const handleSeasonSelect = async (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}?api_key=${apiKey}`
      );
      const data = await response.json();
      setEpisodes(data.episodes || []);
    } catch (error) {
      console.error('Error fetching episodes:', error);
      setEpisodes([]);
    }
  };

  const handleEpisodeSelect = (seasonNum: number, episodeNum: number) => {
    if (onSelectEpisode) {
      onSelectEpisode(seasonNum, episodeNum);
    }
    const url = `https://vidsrc.me/embed/tv?tmdb=${id}&season=${seasonNum}&episode=${episodeNum}`;
    const videoContainer = document.getElementById('video-container');
    if (videoContainer) {
      const iframe = document.createElement('iframe');
      iframe.src = url;
      iframe.style.width = '100%';
      iframe.style.height = '600px';
      iframe.frameBorder = '0';
      iframe.allowFullscreen = true;
      
      videoContainer.innerHTML = '';
      videoContainer.appendChild(iframe);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePlayClick = () => {
    // If we have seasons data, treat it as a TV show regardless of initial mediaType
    if (seasons.length > 0) {
      handleEpisodeSelect(seasons[0].season_number, 1);
    } else {
      const url = `https://vidsrc.me/embed/movie?tmdb=${id}`;
      const videoContainer = document.getElementById('video-container');
      if (videoContainer) {
        const iframe = document.createElement('iframe');
        iframe.src = url;
        iframe.style.width = '100%';
        iframe.style.height = '600px';
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        
        videoContainer.innerHTML = '';
        videoContainer.appendChild(iframe);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 z-50 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto pt-20">
        <button
          onClick={onBack}
          className="mb-6 flex items-center gap-2 text-[#ea384c] hover:text-[#ff4d63] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to browsing
        </button>

        <Card className="bg-[#1a1a1a] border-[#2a2a2a] text-white">
          <CardContent className="p-6">
            <div className="flex gap-6">
              <img
                src={`https://image.tmdb.org/t/p/w500${posterPath}`}
                alt={title}
                className="w-48 rounded-lg shadow-lg"
              />
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{title}</h2>
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg">{rating.toFixed(1)}</span>
                </div>
                <p className="text-gray-300 mb-6">{overview}</p>

                <Button 
                  onClick={handlePlayClick}
                  className="bg-[#ea384c] hover:bg-[#ff4d63] mb-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  {seasons.length > 0 ? 'Play First Episode' : 'Play Movie'}
                </Button>

                {seasons.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Seasons</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {seasons.map((season) => (
                        <button
                          key={season.season_number}
                          onClick={() => handleSeasonSelect(season.season_number)}
                          className={`p-3 rounded-lg border transition-all ${
                            selectedSeason === season.season_number
                              ? 'border-[#ea384c] bg-[#ea384c]/10'
                              : 'border-[#2a2a2a] hover:border-[#ea384c]/50'
                          }`}
                        >
                          Season {season.season_number}
                        </button>
                      ))}
                    </div>

                    {selectedSeason !== null && episodes.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-lg font-semibold mb-4">Episodes</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {episodes.map((episode) => (
                            <button
                              key={episode.episode_number}
                              onClick={() => handleEpisodeSelect(selectedSeason, episode.episode_number)}
                              className="p-3 rounded-lg border border-[#2a2a2a] hover:border-[#ea384c]/50 transition-all"
                            >
                              Episode {episode.episode_number}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MediaDetails;