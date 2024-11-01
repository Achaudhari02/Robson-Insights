import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import { Svg, G, Rect, Text as SvgText, Defs, LinearGradient, Stop } from 'react-native-svg';

export const BarChart = ({ data }) => {

  const svgWidth = 400;
  const svgHeight = 300;
  const margin = { top: 20, right: 30, bottom: 40, left: 100 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const classificationDescription = {
    1: "Nulliparous women with a term, single, cephalic pregnancy in spontaneous labor.",
    2: "Nulliparous women with a term, single, cephalic pregnancy in induced labor or pre-labor cesarean.",
    3: "Multiparous women without previous cesarean, with a term, single, cephalic pregnancy in spontaneous labor.",
    4: "Multiparous women without previous cesarean, with a term, single, cephalic pregnancy in induced labor or pre-labor cesarean.",
    5: "Multiparous women with at least one previous cesarean and a term, single, cephalic pregnancy.",
    6: "Nulliparous women with a single, breech pregnancy.",
    7: "Multiparous women with a single, breech pregnancy.",
    8: "Women with multiple pregnancies (twins, triplets, etc.).",
    9: "Women with a single pregnancy in a transverse or oblique lie.",
    10: "Women with a preterm, single, cephalic pregnancy."
  };
  const CSectionRates = {
    1: "Low (around 10-15%)",
    2: "Moderate to high (around 20-35%)",
    3: "Very low (around 5-10%)",
    4: "Moderate (around 15-25%)",
    5: "Very high (around 50-90%)",
    6: "Very high (around 80-95%)",
    7: "Very high (around 85-95%)",
    8: "High (around 50-80%)",
    9: "Extremely high (close to 100%)",
    10: "Moderate to high (around 20-50%)"
  };

  const xScale = d3Scale
    .scaleLinear()
    .domain([0, d3Array.max(data, (d) => d.responses)])
    .range([0, chartWidth]);

  const yScale = d3Scale
    .scaleBand()
    .domain(data.map((d) => d.classification))
    .range([0, chartHeight])
    .padding(0.2);

  const [selectedBar, setSelectedBar] = useState(null);

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedBar(null);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Cesarean Sections by Group</Text>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <Svg width={20} height={20}>
            <Rect width={20} height={20} fill="url(#csectionLegendGradient)" rx={5} ry={5} />
          </Svg>
          <Text style={styles.legendText}>C-Section</Text>
        </View>
        <View style={styles.legendItem}>
          <Svg width={20} height={20}>
            <Rect width={20} height={20} fill="url(#nonCsectionLegendGradient)" rx={5} ry={5} />
          </Svg>
          <Text style={styles.legendText}>Non-C-Section</Text>
        </View>
      </View>

      <Svg width={svgWidth} height={svgHeight}>
      <Defs>
        <LinearGradient id="csectionGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#FF8A8D"/>
          <Stop offset="100%" stopColor="#FD8B5A"/>
        </LinearGradient>
        <LinearGradient id="nonCsectionGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#66C2B5" />
          <Stop offset="100%" stopColor="#50A0A4" />
        </LinearGradient>
        <LinearGradient id="csectionLegendGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#FF8A8D" />
          <Stop offset="100%" stopColor="#FD8B5A" />
        </LinearGradient>
        <LinearGradient id="nonCsectionLegendGradient" x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0%" stopColor="#66C2B5" />
          <Stop offset="100%" stopColor="#50A0A4" />
        </LinearGradient>
      </Defs>


        <G x={margin.left} y={margin.top}>
          {data.map((d, index) => {
            const csectionCount = d.csectionCount;
            const nonCsectionCount = d.responses - d.csectionCount;
            const csectionWidth = xScale(csectionCount);
            const nonCsectionWidth = xScale(nonCsectionCount);
            const yPosition = yScale(d.classification);

            return (
              <G key={`bar-${index}`} y={yPosition}>
                {csectionCount > 0 && (
                  <Rect
                    width={csectionWidth}
                    height={yScale.bandwidth()}
                    fill="url(#csectionGradient)"
                    onPress={() => setSelectedBar({ data: d })}
                  />
                )}

                {nonCsectionCount > 0 && (
                  <Rect
                    x={csectionCount > 0 ? csectionWidth : 0}
                    width={nonCsectionWidth}
                    height={yScale.bandwidth()}
                    fill="url(#nonCsectionGradient)"
                    onPress={() => setSelectedBar({ data: d })}
                  />
                )}

                {csectionCount > 0 && (
                  <SvgText
                    x={csectionWidth / 2}
                    y={yScale.bandwidth() / 2}
                    fontSize={12}
                    fill="#000"
                    textAnchor="middle"
                    fontFamily="Avenir Next"
                    alignmentBaseline="middle"
                  >
                    {csectionCount}
                  </SvgText>
                )}

                {nonCsectionCount > 0 && (
                  <SvgText
                    x={(csectionCount > 0 ? csectionWidth : 0) + nonCsectionWidth / 2}
                    y={yScale.bandwidth() / 2}
                    fontSize={12}
                    fill="#000"
                    textAnchor="middle"
                    fontFamily="Avenir Next"
                    alignmentBaseline="middle"
                  >
                    {nonCsectionCount}
                  </SvgText>
                )}

                {/* Category Labels */}
                <SvgText
                  x={-10}
                  y={yScale.bandwidth() / 2}
                  fontSize={12}
                  fill="#000"
                  textAnchor="end"
                  fontFamily="Avenir Next"
                  alignmentBaseline="middle"
                >
                  {'Group ' + d.classification}
                </SvgText>
              </G>
            );
          })}

          <SvgText
            x={chartWidth / 2}
            y={svgHeight - margin.bottom + 30}
            fontSize={12}
            fill="gray"
            textAnchor="middle"
            fontFamily="Avenir Next"
          >
            Tap on bars for more information.
          </SvgText>

          <SvgText
            x={-margin.left + 20}
            y={(svgHeight - margin.top - margin.bottom) / 2 + 15}
            fontSize={15}
            fill="#000"
            textAnchor="middle"
            fontWeight="bold"
            fontFamily="Avenir Next"
            transform={`rotate(-90, ${-margin.left + 20}, ${(svgHeight - margin.top - margin.bottom) / 2})`}
          >
            Classification Category
          </SvgText>

          <SvgText
            x={(svgWidth - margin.left - margin.right) / 2}
            y={svgHeight - margin.bottom + 10}
            fontSize={16}
            fill="#000"
            fontFamily="Avenir Next"
            textAnchor="middle"
          >
            Number of Patients
          </SvgText>
        </G>
      </Svg>

      {selectedBar && (
        <Modal
          transparent={true}
          animationType="fade"
          visible={true}
          onRequestClose={() => setSelectedBar(null)}
        >
          <TouchableOpacity style={styles.modalBackground} activeOpacity={1} onPress={handleCloseModal}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>Classification Details</Text>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Classification Description:</Text>{' '}
                {classificationDescription[selectedBar.data.classification]}
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Total Patients in Category:</Text>{' '}
                {selectedBar.data.responses}
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Percent Patients in Category:</Text>{' '}
                {((selectedBar.data.responses / data.totalPatients) * 100).toFixed(2)}%
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Expected C-Section Rate:</Text>{' '}
                {CSectionRates[selectedBar.data.classification]}
              </Text>
              <Text style={styles.modalText}>
                <Text style={styles.boldText}>Actual C-Section Rate:</Text>{' '}
                {((selectedBar.data.csectionCount / selectedBar.data.responses) * 100).toFixed(2)}%
              </Text>
              <TouchableOpacity onPress={() => setSelectedBar(null)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
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
  subtitle: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 10,
    marginLeft: 5,
    fontFamily: 'Avenir Next',
  },
  legendContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignSelf: 'flex-start',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  legendText: {
    marginLeft: 5,
    fontFamily: 'Avenir Next',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    fontFamily: 'Avenir Next',
    color: '#FF5A5F',
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
  closeButton: {
    marginTop: 15,
    alignSelf: 'flex-end',
    backgroundColor: '#FF5A5F',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    fontSize: 16,
    color: 'white',
    fontFamily: 'Avenir Next',
  },
});
