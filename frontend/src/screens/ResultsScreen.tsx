import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { format, parse, set } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Modal, TouchableOpacity, TextInput, Alert } from 'react-native';
import { BarChart, PieChart, Select } from '@/components';
import {YStack} from 'tamagui';
import { endOfDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';


const ResultsScreen = ({ navigation }) => {
  const [results, setResults] = useState([]);
  const [parsedResults, setParsedResults] = useState([]);
  const { user, logoutFn } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [reportGenerated, setReportGenerated] = useState(false);
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

  useEffect(() => {
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

    setParsedResults(processResultsForAnalysis());
  }, [results]);

  const handleSubmit = () => {
    if (!startDate || !endDate) {
      window.alert('Please select both start and end dates.');
      return;
    }
    if (startDate > endDate) {
      window.alert('Start date cannot be after end date.');
      return;
    }
    setModalVisible(false);

    const adjustedEndDate = endOfDay(endDate);

    const filteredResults = allResults.filter((result) => {
      const resultDate = new Date(result.date);
      return resultDate >= startDate && resultDate <= adjustedEndDate;
    });

    setResults(filteredResults);
    setReportGenerated(true);
    navigation.setOptions({
      title: `Report from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}`,
    });
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
        setAllResults(response.data);
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

  const renderModal = () => (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Select Date Range</Text>
          <DatePicker
            selected={startDate}
            onChange={(update) => setDateRange(update)}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            dateFormat="yyyy-MM-dd"
            maxDate={new Date()}
            showYearDropdown
            showMonthDropdown
            dropdownMode="select"
            className="date-picker"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.button} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
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
      {renderModal()}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleExport}
          style={styles.compactButton}>
          <Text style={styles.buttonText}>Download as CSV</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.compactButton}
          onPress={() => {
            if (reportGenerated) {
              setResults(allResults);
              setReportGenerated(false);
              setDateRange([null, null]);
              navigation.setOptions({
                title: 'Results',
              });
            } else {
              setModalVisible(true);
            }
          }}>
          <Text style={styles.buttonText}> {reportGenerated ? 'Exit Report' : 'Generate Report'} </Text>
        </TouchableOpacity>
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
      <BarChart data={parsedResults} />
      <TouchableOpacity onPress={() => navigation.navigate('PieChartAnalysis', { data: parsedResults })}>
        <PieChart data={parsedResults} />
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 5,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  'date-picker': {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginTop: 20,
  },
  compactButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default ResultsScreen;