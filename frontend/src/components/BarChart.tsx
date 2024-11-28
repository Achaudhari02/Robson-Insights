import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import { Svg, G, Rect, Text as SvgText, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { useTheme } from '../ThemeContext';
import { lightTheme, darkTheme } from '../themes';

export const BarChart = ({ data }) => {
  const [screenWidth, setScreenWidth] = useState(Dimensions.get('window').width);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const onChange = ({ window }) => {
      setScreenWidth(window.width);
    };
    const subscription = Dimensions.addEventListener('change', onChange);
    return () => subscription?.remove();
  }, []);

  const cardMargin = 15;
  const cardPadding = 20;

  const svgWidth = screenWidth - 2 * cardMargin - 2 * cardPadding;
  const svgHeight = 300;

  const leftMarginPercentage = 0.15;
  const minLeftMargin = 40;
  const maxLeftMargin = 80;

  const margin = {
    top: 20,
    right: svgWidth * 0.05,
    bottom: 40,
    left: Math.max(minLeftMargin, Math.min(svgWidth * leftMarginPercentage, maxLeftMargin)),
  };

  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;
  const recommendedCSectionRates = {
    1: 10,
    2: 35,
    3: 35,
    4: 20,
    5.1: 50,
    5.2: 50,
    6: 90,
    7: 90,
    8: 70,
    9: 95,
    10: 30,
  };

  const maxResponses = d3Array.max(data, (d) => d.responses) || 0;
  const capValue = maxResponses * 1.1;
  const xScale = d3Scale
    .scaleLinear()
    .domain([0, capValue])
    .range([0, chartWidth]);

  const yScale = d3Scale
    .scaleBand()
    .domain(data.map((d) => d.classification))
    .range([0, chartHeight])
    .padding(0.2);

    const screenStyle = {
      backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor,
      color: theme === 'dark' ? darkTheme.color : lightTheme.color,
    };

  return (
    <View style={[styles.card, screenStyle]}>
      <Text style={[styles.title, screenStyle]}>Caesarean Sections by Classification</Text>
      <View style={[styles.legendContainer, screenStyle]}>
        <View style={[styles.legendItem, screenStyle]}>
          <View style={[styles.legendColorBox, { backgroundColor: '#FF8A8D' }]} />
          <Text style={[styles.legendText, screenStyle]}>C-Section</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColorBox, { backgroundColor: '#66C2B5' }]} />
          <Text style={[styles.legendText, screenStyle]}>Non-C-Section</Text>
        </View>
        <View style={[styles.legendItem, screenStyle]}>
          <Svg width={20} height={2}>
            <Line x1="0" y1="1" x2="20" y2="1" stroke="#FF0000" strokeWidth="2" strokeDasharray="4" />
          </Svg>
          <Text style={[styles.legendText, screenStyle]}>Recommended C-Section Rate</Text>
        </View>
      </View>

      <View>
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
                      fill="#FF8A8D"
                    />
                  )}

                  {nonCsectionCount > 0 && (
                    <Rect
                      x={csectionCount > 0 ? csectionWidth : 0}
                      width={nonCsectionWidth}
                      height={yScale.bandwidth()}
                      fill="#66C2B5"
                    />
                  )}

                  {csectionCount > 0 && (
                    <SvgText
                      x={csectionWidth / 2}
                      y={yScale.bandwidth() / 2}
                      fontSize={12}
                      fill={screenStyle.color}
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

                  <Line
                    x1={xScale((recommendedCSectionRates[d.classification] / 100) * d.responses)}
                    x2={xScale((recommendedCSectionRates[d.classification] / 100) * d.responses)}
                    y1={0}
                    y2={yScale.bandwidth()}
                    stroke="#FF0000"
                    strokeWidth="2"
                    strokeDasharray="4"
                  />

                  <SvgText
                    x={-10}
                    y={yScale.bandwidth() / 2}
                    fontSize={12}
                    fill={screenStyle.color}
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
              y={chartHeight + margin.bottom - 30}
              fontSize={16}
              fill={screenStyle.color}
              fontFamily="Avenir Next"
              textAnchor="middle"
            >
              Number of Patients
            </SvgText>
          </G>
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    margin: 15,
    elevation: 3,
    shadowColor: '#000',
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
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    alignSelf: 'stretch',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
    marginBottom: 5,
  },
  legendColorBox: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  legendText: {
    marginLeft: 5,
    fontFamily: 'Avenir Next',
    flexShrink: 1,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'left',
    marginBottom: 10,
    marginLeft: 5,
    fontFamily: 'Avenir Next',
  },
});