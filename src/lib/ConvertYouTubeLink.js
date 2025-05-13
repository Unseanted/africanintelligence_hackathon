/**
 * Converts a YouTube share link to an embeddable link.
 * @param {string} url - The YouTube share link (e.g., https://youtu.be/04AMaTsXFJU?si=2rv5Wj6V9-jiHiZj)
 * @returns {string} - The embed link (e.g., https://www.youtube.com/embed/04AMaTsXFJU)
 * @throws {Error} - If the URL is invalid or not a YouTube share link
 */
const convertYouTubeLink = (url) => {
  try {
    if (!url || typeof url !== 'string') {
      console.warn('Invalid YouTube URL: URL must be a non-empty string');
      return null;
    }

    // Define patterns for different YouTube URL formats
    const patterns = [
      // Short link: https://youtu.be/VIDEO_ID
      { pattern: /https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)/, idIndex: 1 },
      // Watch link: https://www.youtube.com/watch?v=VIDEO_ID
      { pattern: /https:\/\/www\.youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/, idIndex: 1 },
      // Embed link: https://www.youtube.com/embed/VIDEO_ID
      { pattern: /https:\/\/www\.youtube\.com\/embed\/([a-zA-Z0-9_-]+)/, idIndex: 1 },
      // Short link with params: https://youtu.be/VIDEO_ID?si=SHARE_TOKEN
      { pattern: /https:\/\/youtu\.be\/([a-zA-Z0-9_-]+)(\?.*)?/, idIndex: 1 },
    ];

    for (const { pattern, idIndex } of patterns) {
      const match = url.match(pattern);
      if (match && match[idIndex]) {
        const videoId = match[idIndex];
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }

    console.warn(`Invalid YouTube URL format: ${url}. Expected formats: https://youtu.be/VIDEO_ID, https://www.youtube.com/watch?v=VIDEO_ID, or https://www.youtube.com/embed/VIDEO_ID`);
    return null;
  } catch (error) {
    console.error('Error converting YouTube link:', error);
    return null;
  }
};

export {
  convertYouTubeLink
}

// Example usage:
// try {
//   const shareLink = 'https://youtu.be/04AMaTsXFJU?si=2rv5Wj6V9-jiHiZj';
//   const embedLink = convertYouTubeLinkToEmbed(shareLink);
//   console.log(embedLink); // Output: https://www.youtube.com/embed/04AMaTsXFJU
// } catch (error) {
//   console.error(error.message);
// }