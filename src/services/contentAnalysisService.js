import { PDFDocument } from 'pdf-lib';
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

class ContentAnalysisService {
  constructor() {
    this.ffmpeg = createFFmpeg({ log: true });
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.ffmpeg.load();
      this.initialized = true;
    }
  }

  async analyzePDF(file) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      
      let text = '';
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        text += await page.getText();
      }

      return this.generateQuestions(text);
    } catch (error) {
      console.error('PDF analysis error:', error);
      throw new Error('Failed to analyze PDF');
    }
  }

  async analyzeVideo(file) {
    try {
      await this.initialize();
      
      // Write the video file to FFmpeg's virtual file system
      this.ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(file));
      
      // Extract audio from video
      await this.ffmpeg.run(
        '-i', 'input.mp4',
        '-vn', // No video
        '-acodec', 'libmp3lame',
        '-ar', '44100',
        '-ac', '2',
        '-b:a', '192k',
        'output.mp3'
      );
      
      // Here you would implement speech-to-text conversion
      // For now, we'll return a placeholder
      const transcript = "This is a placeholder transcript. In a real implementation, this would be the actual transcript from the video.";
      
      return this.generateQuestions(transcript);
    } catch (error) {
      console.error('Video analysis error:', error);
      throw new Error('Failed to analyze video');
    } finally {
      // Clean up
      try {
        this.ffmpeg.FS('unlink', 'input.mp4');
        this.ffmpeg.FS('unlink', 'output.mp3');
      } catch (e) {
        console.error('Cleanup error:', e);
      }
    }
  }

  async generateQuestions(content) {
    // Determine content length and adjust number of questions
    const contentLength = content.length;
    const isShortContent = contentLength < 1000; // Less than 1000 characters
    const numQuestions = isShortContent ? 5 : 10;

    // Split content into sections for better question generation
    const sections = this.splitContentIntoSections(content);
    
    const questions = [];
    let questionId = Date.now();

    // Generate questions for each section
    for (const section of sections) {
      // Multiple Choice Questions (30% of total)
      const numMCQ = Math.ceil(numQuestions * 0.3);
      for (let i = 0; i < numMCQ; i++) {
        questions.push({
          id: questionId++,
          type: 'mcq',
          question: this.generateMCQ(section),
          options: this.generateOptions(section),
          correctAnswer: 0 // First option is correct by default
        });
      }

      // True/False Questions (20% of total)
      const numTF = Math.ceil(numQuestions * 0.2);
      for (let i = 0; i < numTF; i++) {
        questions.push({
          id: questionId++,
          type: 'true-false',
          question: this.generateTrueFalse(section),
          correctAnswer: Math.random() > 0.5
        });
      }

      // Short Answer Questions (50% of total)
      const numSA = Math.ceil(numQuestions * 0.5);
      for (let i = 0; i < numSA; i++) {
        questions.push({
          id: questionId++,
          type: 'short-answer',
          question: this.generateShortAnswer(section),
          sampleAnswer: this.generateSampleAnswer(section)
        });
      }
    }

    // Shuffle questions to mix types
    return this.shuffleArray(questions);
  }

  splitContentIntoSections(content) {
    // Split content into paragraphs or sections
    const paragraphs = content.split(/\n\s*\n/);
    return paragraphs.filter(p => p.trim().length > 0);
  }

  generateMCQ(section) {
    // In a real implementation, this would use AI to generate relevant questions
    return `What is the main concept discussed in this section?`;
  }

  generateOptions(section) {
    // In a real implementation, this would use AI to generate relevant options
    return [
      'Option A - Main concept',
      'Option B - Alternative concept',
      'Option C - Related concept',
      'Option D - Unrelated concept'
    ];
  }

  generateTrueFalse(section) {
    // In a real implementation, this would use AI to generate relevant statements
    return 'The section discusses implementation details.';
  }

  generateShortAnswer(section) {
    // In a real implementation, this would use AI to generate relevant questions
    return 'Explain the key points discussed in this section.';
  }

  generateSampleAnswer(section) {
    // In a real implementation, this would use AI to generate a model answer
    return 'The section covers important concepts and their applications...';
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async analyzeContent(file) {
    if (file.type.includes('pdf')) {
      return this.analyzePDF(file);
    } else if (file.type.includes('video')) {
      return this.analyzeVideo(file);
    } else {
      throw new Error('Unsupported file type');
    }
  }
}

export const contentAnalysisService = new ContentAnalysisService(); 