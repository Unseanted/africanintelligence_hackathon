import React from 'react';
import { Text, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Card } from 'react-native-paper';

interface ProgressData {
  labels: string[];
  datasets: number[];
}

export const ProgressChart = ({ data }: { data: ProgressData }) => {
  return (
    <Card className="p-4">
      <Text className="text-xl font-bold mb-4">Learning Progress</Text>
      <LineChart
        data={{
          labels: data.labels,
          datasets: [{ data: data.datasets }]
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        chartConfig={{
          backgroundColor: '#ffffff',
          backgroundGradientFrom: '#ffffff',
          backgroundGradientTo: '#ffffff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
          style: {
            borderRadius: 16
          }
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16
        }}
      />
    </Card>
  );
}; 