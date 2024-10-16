import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import { Svg, G, Rect, Text as SvgText } from 'react-native-svg';

const Analysis = ({ data }) => {

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

  const csectionColor = '#ff7f0e';
  const nonCsectionColor = '#1f77b4';
  const labelPadding = 10;
  const totalPatients = data.reduce((sum, d) => sum + d.responses, 0);
  const [selectedBar, setSelectedBar] = useState(null);

  const handleCloseModal = (e) => {
    if (e.target === e.currentTarget) {
      setSelectedBar(null);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analysis Page</Text>
      <Text> Tap on bars for more information </Text>
      <View style={{ flexDirection: 'row', marginBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 20 }}>
          <Svg width={20} height={20}>
            <Rect width={20} height={20} fill={csectionColor} />
          </Svg>
          <Text style={{ marginLeft: 5 }}>C-Section</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Svg width={20} height={20}>
            <Rect width={20} height={20} fill={nonCsectionColor} />
          </Svg>
          <Text style={{ marginLeft: 5 }}>Non-C-Section</Text>
        </View>
      </View>

      <Svg width={svgWidth} height={svgHeight}>
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
                    fill={csectionColor}
                    onPress={() => setSelectedBar({ data: d })}
                  />
                )}

                {nonCsectionCount > 0 && (
                  <Rect
                    x={csectionCount > 0 ? csectionWidth : 0}
                    width={nonCsectionWidth}
                    height={yScale.bandwidth()}
                    fill={nonCsectionColor}
                    onPress={() => setSelectedBar({ data: d })}
                  />
                )}

                {csectionCount > 0 && (
                  <SvgText
                    x={csectionWidth / 2}
                    y={yScale.bandwidth() / 2 - 5 + labelPadding}
                    fontSize={12}
                    fill="#fff"
                    textAnchor="middle"
                  >
                    {csectionCount}
                  </SvgText>
                )}

                {nonCsectionCount > 0 && (
                  <SvgText
                    x={(csectionCount > 0 ? csectionWidth : 0) + nonCsectionWidth / 2}
                    y={yScale.bandwidth() / 2 - 5 + labelPadding}
                    fontSize={12}
                    fill="#fff"
                    textAnchor="middle"
                  >
                    {nonCsectionCount}
                  </SvgText>
                )}

                <SvgText
                  x={-10}
                  y={yScale.bandwidth() / 2 - 5 + labelPadding}
                  fontSize={12}
                  fill="#000"
                  textAnchor="end"
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
            fontFamily="Arial"
            transform={`rotate(-90, ${-margin.left + 20}, ${(svgHeight - margin.top - margin.bottom) / 2})`}
          >
            Classification Category
          </SvgText>

          <SvgText
            x={(svgWidth - margin.left - margin.right) / 2}
            y={svgHeight - margin.bottom + 10}
            fontSize={16}
            fill="#000"
            fontFamily="Arial"
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
                {((selectedBar.data.responses / totalPatients) * 100).toFixed(2)}%
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
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 20,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  closeButton: {
    marginTop: 15,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 16,
    color: 'blue',
  },
});

export default Analysis;
