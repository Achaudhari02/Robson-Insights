import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, G, Path } from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import * as d3Scale from 'd3-scale';
import { useTheme } from '../ThemeContext';
import { lightTheme, darkTheme } from '../themes';

interface DataItem {
  classification: string;
  responses: number;
}

interface PieChartProps {
  data: DataItem[];
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const { theme, toggleTheme } = useTheme();

  const svgWidth = 400;
  const svgHeight = 300;
  const radius = Math.min(svgWidth, svgHeight) / 2 - 20;
  const separationDistance = 5;

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

    const cardStyle = {
      backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : '#fff',
      shadowColor: theme === 'dark' ? '#fff' : '#000',
      shadowOpacity: 0.2,
      borderWidth: theme === 'dark' ? 1 : 0,
      borderColor: theme === 'dark' ? '#FFFFFF30' : 'transparent',
    };
  const screenStyle = {
    backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor,
    color: theme === 'dark' ? darkTheme.color : lightTheme.color,
  };

  return (
    <View style={[styles.card, cardStyle]}>
      <Text style={[styles.title, screenStyle]}>Caesarean Sections by Classification</Text>
      <Svg width={svgWidth} height={svgHeight}>
        <G x={svgWidth / 2} y={svgHeight / 2}>
          {pieData.map((slice, index) => {
            const [centroidX, centroidY] = arcGenerator.centroid(slice);
            const translateX = (centroidX / Math.sqrt(centroidX ** 2 + centroidY ** 2)) * separationDistance;
            const translateY = (centroidY / Math.sqrt(centroidX ** 2 + centroidY ** 2)) * separationDistance;

            return (
              <Path
                key={`slice-${index}`}
                d={arcGenerator(slice) || undefined}
                fill={colorScale(slice.data.classification)}
                transform={`translate(${translateX}, ${translateY})`}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 15,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
    marginBottom: 10,
    marginLeft: 5,
    fontFamily: 'Avenir Next',
  },
});
