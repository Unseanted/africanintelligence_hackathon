import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Tab3gas = ({ tabs }) => {
  return (
    <TabsList className="tabs-list">
      {tabs.map((tab) => (
        <TabsTrigger value={tab} className="tabs-trigger">
          {tab}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default Tab3gas;
