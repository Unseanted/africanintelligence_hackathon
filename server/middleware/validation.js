const validateForumPost = (req, res, next) => {
    try {
      const { title, content, category, isCommunityPost } = req.body;
  
      // Check for required fields
      if (!title || typeof title !== 'string') {
        return res.status(400).json({ message: 'Title is required and must be a string' });
      }
  
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: 'Content is required and must be a string' });
      }
  
      if (!category || typeof category !== 'string') {
        return res.status(400).json({ message: 'Category is required and must be a string' });
      }
  
      // Validate isCommunityPost (optional, but if provided, must be a boolean or 'true'/'false' string)
      if (isCommunityPost !== undefined) {
        if (typeof isCommunityPost !== 'boolean' && !['true', 'false'].includes(isCommunityPost)) {
          return res.status(400).json({ message: 'isCommunityPost must be a boolean or "true"/"false" string' });
        }
      }
  
      // Validate title and content length
      if (title.length < 3 || title.length > 200) {
        return res.status(400).json({ message: 'Title must be between 3 and 200 characters' });
      }
  
      if (content.length < 10 || content.length > 5000) {
        return res.status(400).json({ message: 'Content must be between 10 and 5000 characters' });
      }
  
      // Validate category against allowed values (based on /categories endpoint)
      const allowedCategories = [
        'general', 'questions', 'resources', 'projects', 'careers', 'events', 'feedback'
      ];
      if (!allowedCategories.includes(category)) {
        return res.status(400).json({ message: `Category must be one of: ${allowedCategories.join(', ')}` });
      }
  
      // If a file is uploaded, it’s handled by multer; no additional validation needed here
  
      next();
    } catch (error) {
      console.error('Error in validateForumPost:', error);
      res.status(500).json({ message: 'Server error during validation' });
    }
  };
  
  const validateComment = (req, res, next) => {
    try {
      const { content } = req.body;
  
      // Check for required fields
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: 'Content is required and must be a string' });
      }
  
      // Validate content length
      if (content.length < 1 || content.length > 2000) {
        return res.status(400).json({ message: 'Comment content must be between 1 and 2000 characters' });
      }
  
      next();
    } catch (error) {
      console.error('Error in validateComment:', error);
      res.status(500).json({ message: 'Server error during validation' });
    }
  };
  
  module.exports = {
    validateForumPost,
    validateComment,
  };