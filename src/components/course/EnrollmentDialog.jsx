
import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, Award, Users, Calendar } from 'lucide-react';

const EnrollmentDialog = ({ open, onOpenChange, course, onConfirm, isLoading }) => {
  if (!course) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">Confirm Course Enrollment</DialogTitle>
          <DialogDescription>
            You're about to enroll in <span className="font-medium text-slate-900 dark:text-slate-100">{course.title}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">Course Details</h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>{course.duration || "Self-paced"}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <BookOpen className="h-4 w-4 text-slate-500" />
                <span>{course.modules?.length || 0} Modules</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Award className="h-4 w-4 text-slate-500" />
                <span>{course.level || "Beginner"}</span>
              </div>
              
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <Users className="h-4 w-4 text-slate-500" />
                <span>{course.enrolled || 0} Students</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg">
            <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-2">What You'll Get</h3>
            <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>Full course access</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>Course forum discussions</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>Course completion certificate</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <span>Lifetime access to materials</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-800/20">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-red-500" />
              <h3 className="font-medium text-red-700 dark:text-red-400">Course Timeline</h3>
            </div>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              {course.startDate ? `Starts on ${new Date(course.startDate).toLocaleDateString()}` : 'Start immediately'}
              {course.endDate ? ` and ends on ${new Date(course.endDate).toLocaleDateString()}` : ''}
            </p>
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between items-center">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                <span>Processing...</span>
              </div>
            ) : (
              'Confirm Enrollment'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollmentDialog;
