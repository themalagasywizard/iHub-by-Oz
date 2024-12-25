export const determineMediaType = (media: any): 'movie' | 'tv' => {
  // Check explicit media_type first
  if (media.media_type === 'tv') {
    return 'tv';
  }

  // For search results and other API endpoints
  if (media.media_type === 'movie') {
    return 'movie';
  }

  // Check TV-specific properties
  const tvIndicators = [
    media.first_air_date,
    media.number_of_seasons,
    media.episode_run_time,
    media.type === 'tv',
    // If it has a name but no title, it's likely a TV show
    (media.name && !media.title)
  ];

  // If any TV indicator is present, consider it a TV show
  if (tvIndicators.some(indicator => indicator)) {
    return 'tv';
  }

  return 'movie';
};