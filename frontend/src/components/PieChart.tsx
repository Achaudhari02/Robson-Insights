import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Svg, G, Path } from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import * as d3Scale from 'd3-scale';
import { useNavigation } from '@react-navigation/native';

interface DataItem {
  classification: string;
  responses: number;
}

interface PieChartProps {
  data: DataItem[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const navigation = useNavigation();
  const svgWidth = 400;
  const svgHeight = 300;
  const radius = Math.min(svgWidth, svgHeight) / 2 - 20;

  const colorScale = d3Scale.scaleOrdinal<string>()
    .domain(data.map((d) => d.classification))
    .range([
      '#FF8A8D', '#66C2B5', '#FD8B5A', '#50A0A4', '#FFD700',
      '#8A2BE2', '#FF4500', '#2E8B57', '#1E90FF', '#DA70D6'
    ]);

  const pieData = d3Shape.pie<DataItem>()
    .value((d) => d.responses)(data);

  const arcGenerator = d3Shape.arc<d3Shape.PieArcDatum<DataItem>>()
    .outerRadius(radius)
    .innerRadius(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cesarean Sections by Group</Text>
        <Svg width={svgWidth} height={svgHeight}>
          <G x={svgWidth / 2} y={svgHeight / 2}>
            {pieData.map((slice, index) => (
              <Path
                key={`slice-${index}`}
                d={arcGenerator(slice) || undefined}
                fill={colorScale(slice.data.classification)}
              />
            ))}
          </G>
        </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    fontFamily: 'Avenir Next',
    fontWeight: 'bold',
  },
});