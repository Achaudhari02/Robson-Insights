import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { BarChart, PieChart, Select } from '@/components';
import {YStack} from 'tamagui';


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

// const [results, setResults] = useState([
//   {
//     id: 1,
//     user: 'User1',
//     classification: '1',
//     csection: true,
//     date: '2023-10-01T12:00:00Z',
//   },
//   {
//     id: 2,
//     user: 'User2',
//     classification: '2',
//     csection: false,
//     date: '2023-10-02T13:00:00Z',
//   },
//   {
//     id: 3,
//     user: 'User3',
//     classification: '1',
//     csection: true,
//     date: '2023-10-03T14:00:00Z',
//   },
//   {
//     id: 4,
//     user: 'User4',
//     classification: '3',
//     csection: false,
//     date: '2023-10-04T15:00:00Z',
//   },
//   {
//     id: 5,
//     user: 'User5',
//     classification: '2',
//     csection: true,
//     date: '2023-10-05T16:00:00Z',
//   },
//   {
//     id: 2,
//     user: 'User2',
//     classification: '2',
//     csection: false,
//     date: '2023-10-02T13:00:00Z',
//   },
//   {
//     id: 2,
//     user: 'User2',
//     classification: '2',
//     csection: false,
//     date: '2023-10-02T13:00:00Z',
//   },
//   {
//     id: 2,
//     user: 'User2',
//     classification: '5',
//     csection: false,
//     date: '2023-10-02T13:00:00Z',
//   },
//   {
//     id: 2,
//     user: 'User2',
//     classification: '10',
//     csection: false,
//     date: '2023-10-02T13:00:00Z',
//   },
//   {
//     id: 2,
//     user: 'User2',
//     classification: '7',
//     csection: false,
//     date: '2023-10-02T13:00:00Z',
//   },
//   {
//     id: 2,
//     user: 'User2',
//     classification: '9',
//     csection: false,
//     date: '2023-10-02T13:00:00Z',
//   },
//   // Add more dummy data if needed
// ]);

const ResultsScreen = ({ navigation }) => {
  const [results, setResults] = useState([]);
  const { user, logoutFn } = useAuth();
  const [isAnalysisView, setIsAnalysisView] = useState(false);
  const [filters, setFilters] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedType, setSelectedType] = useState('group');
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button onPress={() => logoutFn()} title="Logout" />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    // Automatically fetch entries when a default group is set
    if (selectedId !== null) {
      fetchEntries();
    }

  }, [selectedId]);

  useEffect(() => {
    axiosInstance.get('/survey/filters/', {
      headers: {
        Authorization: `Token ${user.token}`,
      }
    })
      .then(response => setFilters(response.data))
      .catch(error => console.error('Error fetching filters:', error));

    axiosInstance.get('/users/groups/', {
      headers: {
        Authorization: `Token ${user.token}`,
      }
    })
      .then(response => {
        setGroups(response.data); if (response.data.length > 0) {
          // Set the first group as the default selection
          setSelectedId(response.data[0].id);
        }
      })
      .catch(error => console.error('Error fetching groups:', error));
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

  const handleSelectionChange = (value) => {
    setSelectedId(value);
  };

  const handleTypeChange = (value) => {
    setSelectedType(value);
    setSelectedId(null);
  };

  const fetchEntries = () => {
    const prefix = selectedType === 'group' ? 'group-' : 'filter-';
    const endpoint = `/survey/entries/filter/${prefix}${selectedId}/`;

    axiosInstance.get(endpoint, {
      headers: { Authorization: `Token ${user.token}` }
    })
      .then(response => {
        setResults(response.data);
        // Use the response data for visualizations
      })
      .catch(error => console.error(`Error fetching entries for ${selectedType}:`, error));
  };


  const renderTableHeader = () => (
    <View style={styles.tableRow}>
      <Text style={styles.columnHeader}>User</Text>
      <Text style={styles.columnHeader}>Classification</Text>
      <Text style={styles.columnHeader}>C-Section</Text>
      <Text style={styles.columnHeader}>Date</Text>
    </View>
  );

  const renderTableRow = (result) => (
    <View style={styles.tableRow} key={result.id.toString()}>
      <Text style={styles.cell}>{result.username}</Text>
      <Text style={styles.cell}>Group {result.classification}</Text>
      <Text style={styles.cell}>{formatCSection(result.csection)}</Text>
      <Text style={styles.cell}>{formatDate(result.date)}</Text>
    </View>
  );

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get('survey/download-survey-csv/', {
        headers: {
          'Authorization': `Token ${user.token}`
        },
        responseType: 'blob'
      });

      const blob = new Blob([response.data], { type: 'text/csv' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'survey_data.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
    }
  };


  return (
    <View style={{ flex: 1 }}>
    <View style={styles.export}>
      <Button
        onPress={() => handleExport()}
        title="Download as CSV"
      />
    </View>
    <ScrollView style={styles.container}>
    <YStack gap="$4" padding="$4">
      <Select
        value={selectedType}
        onValueChange={handleTypeChange}
        items={[
          { label: 'Group', value: 'group' },
          { label: 'Filter', value: 'filter' }
        ]}
      />

      <Select
        value={selectedId}
        onValueChange={handleSelectionChange}
        items={(selectedType === 'group' ? groups : filters).map(item => ({
          label: item.name,
          value: item.id
        }))}
      />

    </YStack>
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
  export: {
    marginLeft: 10,
    marginTop: 20,
    alignSelf: 'flex-start',
  }
});

export default ResultsScreen;