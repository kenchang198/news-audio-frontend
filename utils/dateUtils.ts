export const formatEpisodeTitle = (episodeId: string, createdAt?: string): string => {
  let dateStr = episodeId.match(/^\d{4}-\d{2}-\d{2}$/) ? episodeId : createdAt?.split(' ')[0];
  
  if (!dateStr) {
    const dateMatch = episodeId.match(/(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      dateStr = dateMatch[1];
    }
  }
  
  if (!dateStr) {
    return episodeId;
  }
  
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    return episodeId;
  }
  
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const dayOfWeek = dayNames[date.getDay()];
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${dayOfWeek}`;
};
