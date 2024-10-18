import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { PieChart } from '@/components';

const PieChartAnalysisScreen = ({ route }) => {
  const { data } = route.params; // Access the passed data

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>X Hospital’s February Data</Text>
      <Text style={styles.subHeader}>Cesarean Sections by Group</Text>
      <PieChart data={data} />
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: getColor(index) }]} />
            <Text style={styles.legendText}>{`Group ${item.classification}`}</Text>
          </View>
        ))}
      </View>
      <View style={styles.frameContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.frame}>
            <Text style={styles.frameText}>{`Group ${item.classification}`}</Text>
            <Text style={styles.frameText}>{`${item.responses} Women`}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.description}>
        Group 1: Nulliparous, single cephalic, ≥37 weeks, in spontaneous labor
      </Text>
    </ScrollView>
  );
};

const getColor = (index) => {
  const colors = [
    '#FF8A8D', '#66C2B5', '#FD8B5A', '#50A0A4', '#FFD700',
    '#8A2BE2', '#FF4500', '#2E8B57', '#1E90FF', '#DA70D6'
  ];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  legendColor: {
    width: 10,
    height: 10,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
  },
  frameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  frame: {
    width: '45%',
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  frameText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default PieChartAnalysisScreen;