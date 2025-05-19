import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  User, 
  Shield, 
  Calendar,
  ChevronDown,
  ChevronRight,
  Trophy,
  Puzzle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const SidebarItem = ({ icon: Icon, label, to, isActive }) => {
  return (
    <Link to={to}>
      <Button
        variant="ghost"
        className={cn(
          "w-full justify-start mb-1",
          isActive ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
        )}
      >
        <Icon className="mr-2 h-4 w-4" />
        <span>{label}</span>
      </Button>
    </Link>
  );
};

const StudentSidebar = () => {
  const location = useLocation();
  const [coursesOpen, setCoursesOpen] = useState(
    location.pathname.startsWith('/student/courses')
  );
  const [accountOpen, setAccountOpen] = useState(
    location.pathname.includes('/account') || location.pathname.includes('/security')
  );
  const [eventsOpen, setEventsOpen] = useState(
    location.pathname.startsWith('/student/events')
  );
  const [challengesOpen, setChallengesOpen] = useState(
    location.pathname.startsWith('/student/challenges')
  );
  const [lessonsOpen, setLessonsOpen] = useState(
    location.pathname.startsWith('/student/lessons')
  );

  useEffect(() => {
    setCoursesOpen(location.pathname.startsWith('/student/courses'));
    setAccountOpen(
      location.pathname.includes('/account') || location.pathname.includes('/security')
    );
    setEventsOpen(location.pathname.startsWith('/student/events'));
    setChallengesOpen(location.pathname.startsWith('/student/challenges'));
    setLessonsOpen(location.pathname.startsWith('/student/lessons'));
  }, [location.pathname]);

  return (
    <div className="flex h-screen flex-col border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex flex-col p-4">
        <h2 className="text-lg font-semibold mb-6 px-2">Student Portal</h2>
        
        <div className="space-y-1">
          <SidebarItem 
            icon={Home} 
            label="Dashboard" 
            to="/student" 
            isActive={location.pathname === '/student'}
          />
          
          <Collapsible open={coursesOpen} onOpenChange={setCoursesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between mb-1">
                <div className="flex items-center">
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Courses</span>
                </div>
                {coursesOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Link to="/student/courses">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 pl-8",
                    location.pathname === '/student/courses' ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                  )}
                >
                  All Courses
                </Button>
              </Link>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={lessonsOpen} onOpenChange={setLessonsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between mb-1">
                <div className="flex items-center">
                  <Puzzle className="mr-2 h-4 w-4" />
                  <span>Interactive Lessons</span>
                </div>
                {lessonsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Link to="/student/lessons">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 pl-8",
                    location.pathname === '/student/lessons' ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                  )}
                >
                  All Lessons
                </Button>
              </Link>
              <Link to="/student/lessons/in-progress">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 pl-8",
                    location.pathname === '/student/lessons/in-progress' ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                  )}
                >
                  In Progress
                </Button>
              </Link>
              <Link to="/student/lessons/completed">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 pl-8",
                    location.pathname === '/student/lessons/completed' ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                  )}
                >
                  Completed
                </Button>
              </Link>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={eventsOpen} onOpenChange={setEventsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between mb-1">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>Events</span>
                </div>
                {eventsOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Link to="/student/events">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 pl-8",
                    location.pathname === '/student/events' ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                  )}
                >
                  All Events
                </Button>
              </Link>
              <Link to="/student/events/my-teams">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 pl-8",
                    location.pathname === '/student/events/my-teams' ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                  )}
                >
                  My Teams
                </Button>
              </Link>
            </CollapsibleContent>
          </Collapsible>
          
          <SidebarItem 
            icon={MessageSquare} 
            label="Forum" 
            to="/student/forum" 
            isActive={location.pathname === '/student/forum'}
          />

          <Collapsible open={challengesOpen} onOpenChange={setChallengesOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between mb-1">
                <div className="flex items-center">
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>Challenges</span>
                </div>
                {challengesOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Link to="/student/challenges">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 pl-8",
                    location.pathname === '/student/challenges' ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                  )}
                >
                  All Challenges
                </Button>
              </Link>
              <Link to="/student/challenges/my-teams">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 pl-8",
                    location.pathname === '/student/challenges/my-teams' ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                  )}
                >
                  My Teams
                </Button>
              </Link>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible open={accountOpen} onOpenChange={setAccountOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between mb-1">
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  <span>Account</span>
                </div>
                {accountOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <Link to="/student/account">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 pl-8",
                    location.pathname === '/student/account' ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                  )}
                >
                  Profile
                </Button>
              </Link>
              <Link to="/student/security">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start mb-1 pl-8",
                    location.pathname === '/student/security' ? "bg-muted text-primary font-medium" : "hover:bg-muted/50"
                  )}
                >
                  Security
                </Button>
              </Link>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>
    </div>
  );
};

export default StudentSidebar;
