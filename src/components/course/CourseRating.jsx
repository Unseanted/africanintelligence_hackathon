
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, User } from 'lucide-react';
import { useTourLMS } from '@/contexts/TourLMSContext';
import { getCourseRatings, rateCourse } from '@/api/courseService';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const CourseRating = ({ courseId }) => {
  const { user, token } = useTourLMS();
  const { toast } = useToast();
  const [ratings, setRatings] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (token && courseId) {
      fetchRatings();
    }
  }, [token, courseId]);

  const fetchRatings = async () => {
    try {
      setLoading(true);
      const ratingsData = await getCourseRatings(courseId, token);
      
      setRatings(ratingsData || []);
      
      // Check if user has already rated this course
      const userExistingRating = ratingsData.find(r => r.user?._id === user?._id);
      if (userExistingRating) {
        setUserRating(userExistingRating.rating);
        setComment(userExistingRating.comment || '');
        setHasRated(true);
      }
      
      // Calculate average rating
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc, curr) => acc + curr.rating, 0);
        setAverageRating((sum / ratingsData.length).toFixed(1));
      }
    } catch (error) {
      console.error('Error fetching course ratings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load course ratings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    if (userRating === 0) {
      toast({
        title: 'Rating required',
        description: 'Please select a star rating before submitting',
        variant: 'destructive',
      });
      return;
    }

    try {
      setSubmitting(true);
      await rateCourse(courseId, userRating, comment, token);
      
      toast({
        title: 'Thank you!',
        description: 'Your rating has been submitted successfully',
      });
      
      // Refresh ratings
      await fetchRatings();
      setHasRated(true);
    } catch (error) {
      console.error('Error submitting course rating:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your rating. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const StarRating = ({ editable = false }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => editable && setUserRating(star)}
            onMouseEnter={() => editable && setHoveredRating(star)}
            onMouseLeave={() => editable && setHoveredRating(0)}
            disabled={!editable}
            className={`${!editable ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Star
              className={`h-6 w-6 ${
                (editable && (hoveredRating ? star <= hoveredRating : star <= userRating)) ||
                (!editable && star <= userRating)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="h-28 w-full" />
        <div className="space-y-4 mt-6">
          <Skeleton className="h-8 w-40" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Course Ratings</h3>
          {ratings.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="font-medium">{averageRating}</span>
              <span className="text-gray-500">({ratings.length} {ratings.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>
      </div>

      {!hasRated && (
        <Card className="p-4">
          <h4 className="font-medium mb-3">Rate This Course</h4>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Your Rating:</span>
              <StarRating editable={true} />
            </div>
            <Textarea
              placeholder="Share your experience with this course (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button onClick={handleSubmitRating} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Rating'}
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-4">
        <h4 className="font-medium">Student Reviews</h4>
        
        {ratings.length === 0 ? (
          <Card className="p-6 text-center">
            <Star className="mx-auto h-12 w-12 text-gray-300 mb-2" />
            <h3 className="text-lg font-medium">No Reviews Yet</h3>
            <p className="text-gray-500 mb-4">Be the first to review this course</p>
          </Card>
        ) : (
          ratings.map((rating) => (
            <Card key={rating._id} className="p-4">
              <div className="flex gap-4">
                <Avatar>
                  <AvatarImage src={rating.user?.profilePicture || ''} alt={rating.user?.name || 'User'} />
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h5 className="font-medium">{rating.user?.name || 'Anonymous'}</h5>
                  <div className="flex items-center gap-2 my-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= rating.rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(rating.date), 'PPp')}
                    </span>
                  </div>
                  {rating.comment && <p className="mt-2">{rating.comment}</p>}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseRating;
