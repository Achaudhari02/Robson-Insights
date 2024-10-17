import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, G, Path } from 'react-native-svg';
import * as d3Shape from 'd3-shape';
import * as d3Scale from 'd3-scale';

// Define the type for the data prop
interface DataItem {
  classification: string;
  responses: number;
}

interface PieChartProps {
  data: DataItem[];
}

const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const svgWidth = 400;
  const svgHeight = 300;
  const radius = Math.min(svgWidth, svgHeight) / 2 - 20;
  const [selectedSlice, setSelectedSlice] = useState<DataItem | null>(null);

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

  // Define classificationDescription within the component
  const classificationDescription: Record<string, string> = {
    'Group 1': 'Description for Group 1',
    'Group 2': 'Description for Group 2',
    'Group 3': 'Description for Group 3',
    'Group 4': 'Description for Group 4',
    'Group 5': 'Description for Group 5',
    'Group 6': 'Description for Group 6',
    'Group 7': 'Description for Group 7',
    'Group 8': 'Description for Group 8',
    'Group 9': 'Description for Group 9',
    'Group 10': 'Description for Group 10',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cesarean Sections by Group</Text>

      <Svg width={svgWidth} height={svgHeight}>
        <G x={svgWidth / 2} y={svgHeight / 2}>
          {pieData.map((slice, index) => (
            <G key={`slice-${index}`}>
              <Path
                d={arcGenerator(slice) || undefined}
                fill={colorScale(slice.data.classification)}
                onPress={() => setSelectedSlice(slice.data)}
              />
            </G>
          ))}
        </G>
      </Svg>

      <View style={styles.legendContainer}>
        {data.map((d, index) => (
          <View key={`legend-${index}`} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: colorScale(d.classification) }]} />
            <Text style={styles.legendText}>{`Group ${d.classification}`}</Text>
          </View>
        ))}
      </View>

      {selectedSlice && (
        <View style={styles.descriptionContainer}>
          <Text style={styles.boldText}>Classification Description:</Text>
          <Text style={styles.modalText}>
            {classificationDescription[selectedSlice.classification]}
          </Text>
        </View>
      )}
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
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 10,
  },
  legendColor: {
    width: 10,
    height: 10,
    marginRight: 5,
  },
  legendText: {
    fontFamily: 'Avenir Next',
  },
  descriptionContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'Avenir Next',
    color: '#484848',
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default PieChart;