import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import Recommendations from '@/components/analytics/Recommendations';
import PerformanceInsights from '@/components/analytics/PerformanceInsights';
import { 
  LayoutDashboard,
  Lightbulb,
  TrendingUp,
  Settings
} from 'lucide-react';

const Analytics = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics & Insights</h1>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Performance
          </TabsTrigger>
          {/* <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <AnalyticsDashboard />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          <Recommendations />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <PerformanceInsights />
        </TabsContent>

       
      </Tabs>
    </div>
  );
};

export default Analytics; 