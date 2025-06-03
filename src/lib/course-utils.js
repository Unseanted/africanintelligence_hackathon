// lib/course-utils.js
export async function getCourseContent(courseId, lessonId) {
  // In a real implementation, you would fetch this from your database
  // This is a simplified version

  const mockCourses = {
    "course-1": {
      title: "Introduction to React",
      description: "Learn the fundamentals of React programming",
      lessons: {
        "lesson-1": {
          title: "React Components",
          content:
            "Components are the building blocks of React applications...",
        },
        "lesson-2": {
          title: "State and Props",
          content:
            "State represents internal data, props are passed from parent components...",
        },
      },
    },
  };

  if (!courseId) return { message: "No specific course context" };

  const course = mockCourses[courseId] || {};
  let content = {
    courseTitle: course.title,
    courseDescription: course.description,
  };

  if (lessonId && course.lessons && course.lessons[lessonId]) {
    content.currentLesson = course.lessons[lessonId];
  }

  return content;
}
