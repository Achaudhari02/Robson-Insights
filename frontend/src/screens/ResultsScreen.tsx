import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import {BarChart, PieChart} from '@/components';

const questions = [
  { question: 'Was this a multiple pregnancy?', key: 'mp' },
  { question: 'Was this a transverse or oblique lie?', key: 'lie' },
  { question: 'Was this a breech pregnancy?', key: 'bp' },
  { question: 'Was the gestational age <37 weeks?', key: 'ga' },
  { question: 'Was this a multiparous woman?', key: 'mw' },
  { question: 'Were there previous uterine scars?', key: 'us' },
  { question: 'Was the labor induced or the cesarean section started before labor?', key: 'li' },
  { question: 'Was this a cesarean section?', key: 'cs' },
];

const ResultsScreen = ({ navigation }) => {
  const [results, setResults] = useState([
    {
      id: 1,
      user: 'User1',
      classification: '1',
      csection: true,
      date: '2023-10-01T12:00:00Z',
    },
    {
      id: 2,
      user: 'User2',
      classification: '2',
      csection: false,
      date: '2023-10-02T13:00:00Z',
    },
    {
      id: 3,
      user: 'User3',
      classification: '1',
      csection: true,
      date: '2023-10-03T14:00:00Z',
    },
    {
      id: 4,
      user: 'User4',
      classification: '3',
      csection: false,
      date: '2023-10-04T15:00:00Z',
    },
    {
      id: 5,
      user: 'User5',
      classification: '2',
      csection: true,
      date: '2023-10-05T16:00:00Z',
    },
    {
      id: 2,
      user: 'User2',
      classification: '2',
      csection: false,
      date: '2023-10-02T13:00:00Z',
    },
    {
      id: 2,
      user: 'User2',
      classification: '2',
      csection: false,
      date: '2023-10-02T13:00:00Z',
    },
    {
      id: 2,
      user: 'User2',
      classification: '5',
      csection: false,
      date: '2023-10-02T13:00:00Z',
    },
    {
      id: 2,
      user: 'User2',
      classification: '10',
      csection: false,
      date: '2023-10-02T13:00:00Z',
    },
    {
      id: 2,
      user: 'User2',
      classification: '7',
      csection: false,
      date: '2023-10-02T13:00:00Z',
    },
    {
      id: 2,
      user: 'User2',
      classification: '9',
      csection: false,
      date: '2023-10-02T13:00:00Z',
    },
    // Add more dummy data if needed
  ]);

  const { user, logoutFn } = useAuth();
  const [isAnalysisView, setIsAnalysisView] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={() => logoutFn()} title="Logout" />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        /*
        const resp = await axiosInstance.get('/survey/entries/', {
          headers: {
            Authorization: `Token ${user.token}`,
          },
        });
        setResults(resp.data);
        */
      } catch (error) {
        console.error('Error fetching survey results:', error);
      }
    };

    fetchResults();
  }, []);

  const processResultsForAnalysis = () => {
    const categoryData = {};

    results.forEach((result) => {
      const { classification, csection } = result;
      if (!categoryData[classification]) {
        categoryData[classification] = { responses: 0, csectionCount: 0 };
      }
      categoryData[classification].responses += 1;
      if (csection) {
        categoryData[classification].csectionCount += 1;
      }
    });

    return Object.keys(categoryData).map((classification) => ({
      classification,
      responses: categoryData[classification].responses,
      csectionCount: categoryData[classification].csectionCount,
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MM/dd/yy');
  };

  const formatCSection = (csection) => {
    return csection ? 'Yes' : 'No';
  };

  const renderTableHeader = () => (
    <View style={styles.tableRow}>
      <Text style={styles.columnHeader}>ID</Text>
      <Text style={styles.columnHeader}>User</Text>
      <Text style={styles.columnHeader}>Classification</Text>
      <Text style={styles.columnHeader}>C-Section</Text>
      <Text style={styles.columnHeader}>Date</Text>
    </View>
  );

  const renderTableRow = (result) => (
    <View style={styles.tableRow} key={result.id.toString()}>
      <Text style={styles.cell}>{result.id}</Text>
      <Text style={styles.cell}>{result.user}</Text>
      <Text style={styles.cell}>{result.classification}</Text>
      <Text style={styles.cell}>{formatCSection(result.csection)}</Text>
      <Text style={styles.cell}>{formatDate(result.date)}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container}>
        <BarChart data={processResultsForAnalysis()} />
        <TouchableOpacity onPress={() => navigation.navigate('PieChartAnalysis', { data: processResultsForAnalysis() })}>
        <PieChart data={processResultsForAnalysis()} />
        </TouchableOpacity>
        {renderTableHeader()}
        {results.map(renderTableRow)}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 20,
    backgroundColor: 'white',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingVertical: 10,
  },
  columnHeader: {
    fontWeight: 'bold',
  },
  cell: {
    marginHorizontal: 5,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  buttonContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default ResultsScreen;