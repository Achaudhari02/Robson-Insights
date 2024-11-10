import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { format, endOfDay} from 'date-fns';
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Modal, TouchableOpacity} from 'react-native';
import { BarChart, PieChart, Select} from '@/components';
import {YStack } from 'tamagui';
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
        <TouchableOpacity onPress={logoutFn} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Logout</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
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
    <View style={styles.tableHeader}>
      <Text style={styles.columnHeader}>ID</Text>
      <View style={styles.tableRow}>
        <Text style={styles.columnHeader}>User</Text>
        <Text style={styles.columnHeader}>Classification</Text>
        <Text style={styles.columnHeader}>C-Section</Text>
        <Text style={styles.columnHeader}>Date</Text>
      </View>
    </View>
  );


  const renderReportModal = () => (
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

  const renderTableRow = (result, index) => (
    <View
      style={[
        styles.tableRow,
        index % 2 === 0 ? styles.rowEven : styles.rowOdd,
      ]}
      key={`${result.id}-${index}`}
    >
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
      console.error('Error exporting CSV:', error);
    }
  };

const [file, setFile] = useState(null);
const [errorMessage, setErrorMessaage] = useState("");
const [successMessage, setSuccessMessage] = useState("");
const [errorMessageEmail, setErrorMessaageEmail] = useState("");
const [successMessageEmail, setSuccessMessageEmail] = useState("");
const [email, setEmail] = useState('');

const handleTextChange = (event) => {
  setEmail(event.target.value);
};

const handleEmail = async (event) => {
  event.preventDefault();
  
  if (!email) {
      alert("Please provide an email.");
      return;
  }

  const formData = new FormData();
  formData.append('email', email);

  try {
      const response = await axiosInstance.get(`survey/download-survey-csv/?email=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Token ${user.token}`,
        },
      });
      setErrorMessaageEmail("");
      setSuccessMessageEmail("Sent!");
  } catch (error) {
      setSuccessMessageEmail("");
      setErrorMessaageEmail("Email failed to send.");
      console.error("Error sending email:", error);
  }
};

const handleFileChange = (event) => {
  setFile(event.target.files[0]);
};

const handleUpload = async () => {
  if (!file) {
    alert("Please select a file before uploading.");
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await axiosInstance.post('survey/entries/upload/', formData, {
      headers: {
        'Authorization': `Token ${user.token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    setErrorMessaage("");
    setSuccessMessage(response.data["message"]);
    fetchEntries();
  } catch (e) {
    setSuccessMessage("");
    if (e.response.status == 422) {
      setErrorMessaage("Invalid file format");
    } else {
      setErrorMessaage("Error uploading file");
    }
  }
}


  return (
    <View style={{ flex: 1 }}>
      {renderReportModal()}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleExport}
          style={styles.compactButton}>
          <Text style={styles.buttonText}>Download as CSV</Text>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <input placeholder={"Enter email"} style={styles.emailInput} onChange={handleTextChange}></input>
          <TouchableOpacity
            onPress={handleEmail}
            style={styles.compactButton}>
            <Text style={styles.buttonText}>Email CSV</Text>
          </TouchableOpacity>
          <Text style={errorMessageEmail.length == 0 ? styles.successMessage : styles.errorMessage}>{errorMessageEmail.length == 0 ? successMessageEmail : errorMessageEmail}</Text>
        </View>

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
        <View style={styles.inputContainer}>
          <input type="file" style={styles.fileInput} onChange={handleFileChange} accept=".csv, .xlsx" />
          <TouchableOpacity
            style={styles.compactButton}
            onPress={() => handleUpload()}
          >
            <Text style={styles.buttonText}>Import CSV</Text>
          </TouchableOpacity>
          <Text style={errorMessage.length == 0 ? styles.successMessage : styles.errorMessage}>{errorMessage.length == 0 ? successMessage : errorMessage}</Text>
        </View>
      </View>
      <ScrollView style={styles.container}>
        <YStack gap="$4" padding="$4">
            <Select
              value={selectedType}
              onValueChange={handleTypeChange}
              items={[
                { label: 'Group', value: 'group' },
                { label: 'Configuration', value: 'filter' }
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
    backgroundColor: '#f7f9fc',
  },
  scrollContainer: {
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  headerLogout: {
    marginRight: 10,
    backgroundColor: '#007bff',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    color: '#fff',
    fontSize: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    alignSelf: 'center',
  },
  downloadButton: {
    backgroundColor: '#28a745',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 4,
    alignSelf: 'center',
    marginBottom: 20,
  },
  downloadButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 10,
    borderRadius: 4,
    marginTop: 20,
  },
  columnHeader: {
    flex: 1,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  rowEven: {
    backgroundColor: '#e9f1fb',
  },
  rowOdd: {
    backgroundColor: '#fff',
  },
  cell: {
    flex: 1,
    textAlign: 'center',
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  headerButton: {
    marginRight: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: '#007bff',
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
  headerButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    justifyContent: 'space-between',
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileInput: {
    width: '55%',
  },
  successMessage: {
    marginLeft: 10,
    color: 'green',
  },
  errorMessage: {
    marginLeft: 10,
    color: 'red',
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
    marginBottom: 20,
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
  emailInput: {
    marginRight: 10,
  }
});

export default ResultsScreen;