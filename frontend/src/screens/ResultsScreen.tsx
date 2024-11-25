import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Button as TamaguiButton } from 'tamagui';
import { BarChart, PieChart, Select } from '@/components';
import { YStack } from 'tamagui';
import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { format, endOfDay } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Menu, Moon, Sun } from '@tamagui/lucide-icons';
import { useTheme } from '../ThemeContext';
import { lightTheme, darkTheme } from '../themes';

const ResultsScreen = ({ navigation }) => {
  const [results, setResults] = useState([]);
  const [parsedResults, setParsedResults] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [reportGenerated, setReportGenerated] = useState(false);
  const [filters, setFilters] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedType, setSelectedType] = useState('group');
  const [selectedId, setSelectedId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 25;
  const [menuOpen, setMenuOpen] = useState(false);
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessaage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessageEmail, setErrorMessaageEmail] = useState('');
  const [successMessageEmail, setSuccessMessageEmail] = useState('');
  const [email, setEmail] = useState('');
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [initialSelectedType, setInitialSelectedType] = useState('group');
  const [initialSelectedId, setInitialSelectedId] = useState(null);
  const { user, logoutFn } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{ display: 'flex', flexDirection: 'row'}}>
          <TamaguiButton
            icon={theme === 'dark' ? <Sun size="$2" color={darkTheme.color} /> : <Moon size="$2" color={lightTheme.color}/>}
            backgroundColor="$colorTransparent"
            margin="$2"
            onPress={() => {
              toggleTheme();
            }}
            hoverStyle={{borderColor: '$colorTransparent'}}
          >
          </TamaguiButton>
          <TamaguiButton
              size="$4"
              backgroundColor="$blue10"
              color="white"
              borderRadius="$2"
              margin="$2"
              onPress={logoutFn}
              hoverStyle={styles.tamaguiButton}
            >
              Logout
          </TamaguiButton>
        </View>
      ),
    });
  }, [navigation, theme]);

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
          setInitialSelectedId(response.data[0].id);
        }
      })
      .catch((error) => console.error('Error fetching groups:', error));
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

  useEffect(() => {
    const totalPages = Math.ceil(results.length / entriesPerPage) || 1;
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
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

    axiosInstance
      .get(endpoint, {
        headers: { Authorization: `Token ${user.token}` },
      })
      .then((response) => {
        setResults(response.data);
        setAllResults(response.data);
      })
      .catch((error) =>
        console.error(`Error fetching entries for ${selectedType}:`, error)
      );
  };

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
            <TouchableOpacity
              style={styles.button}
              onPress={() => setModalVisible(false)}
            >
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

  const renderEmailModal = () => (
    <Modal
      visible={emailModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setEmailModalVisible(false)}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Email CSV</Text>
          <View style={styles.inputContainer}>
            <input
              placeholder={'Enter email'}
              style={styles.emailInput}
              onChange={handleTextChange}
              value={email}
            ></input>
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setEmailModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleEmail}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={
              errorMessageEmail.length === 0
                ? styles.successMessage
                : styles.errorMessage
            }
          >
            {errorMessageEmail.length === 0
              ? successMessageEmail
              : errorMessageEmail}
          </Text>
        </View>
      </View>
    </Modal>
  );

  const renderImportModal = () => (
    <Modal
      visible={importModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setImportModalVisible(false)}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Import CSV</Text>
          <View style={styles.inputContainer}>
            <input
              type="file"
              style={styles.fileInput}
              onChange={handleFileChange}
              accept=".csv, .xlsx"
            />
          </View>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setImportModalVisible(false);
                setErrorMessaage('');
                setSuccessMessage('');
              }}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleUpload}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={
              errorMessage.length === 0
                ? styles.successMessage
                : styles.errorMessage
            }
          >
            {errorMessage.length === 0 ? successMessage : errorMessage}
          </Text>
        </View>
      </View>
    </Modal>
  );

  const renderFilterModal = () => (
    <Modal
      visible={filterModalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setFilterModalVisible(false)}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Data View</Text>
          <YStack gap="$4" padding="$4">
            <Select
              value={selectedType}
              onValueChange={handleTypeChange}
              items={[
                { label: 'Group', value: 'group' },
                { label: 'Configuration', value: 'filter' },
              ]}
            />
            <Select
              value={selectedId}
              onValueChange={handleSelectionChange}
              items={(selectedType === 'group' ? groups : filters).map(
                (item) => ({
                  label: item.name,
                  value: item.id,
                })
              )}
            />
          </YStack>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => setFilterModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                fetchEntries();
                setIsFilterApplied(true);
                setFilterModalVisible(false);
              }}
            >
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
        index % 2 === 0 ? (theme === 'dark' ? screenStyle : styles.rowEven) : screenStyle,
      ]}
      key={`${result.id}-${index}`}
    >
      <Text style={[styles.cell, {color: screenStyle.color}]}>Group {result.classification}</Text>
      <Text style={[styles.cell, {color: screenStyle.color}]}>{formatCSection(result.csection)}</Text>
      <Text style={[styles.cell, {color: screenStyle.color}]}>{formatDate(result.date)}</Text>
    </View>
  );

  const renderTableHeader = () => (
    <View style={[styles.tableRow, {backgroundColor: theme === 'dark' ? screenStyle.backgroundColor : styles.rowEven.backgroundColor, borderColor: theme === 'dark' ? darkTheme.color : 'transparent', borderBottomWidth: theme === 'dark' ? 3 : 0}]}>
      <Text style={[styles.columnHeader, {color: screenStyle.color}]}>Classification</Text>
      <Text style={[styles.columnHeader, {color: screenStyle.color}]}>C-Section</Text>
      <Text style={[styles.columnHeader, {color: screenStyle.color}]}>Date</Text>
    </View>
  );

  const handleExport = async () => {
    try {
      const response = await axiosInstance.get('survey/download-survey-csv/', {
        headers: {
          Authorization: `Token ${user.token}`,
        },
        responseType: 'blob',
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

  const downloadTemplate = async () => {
    try {
      const response = await axiosInstance.get('survey/generate-quarterly-xlsx/', {
        headers: {
          Authorization: `Token ${user.token}`,
        },
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quarterly_template.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleTextChange = (event) => {
    setEmail(event.target.value);
  };

  const handleEmail = async (event) => {
    event.preventDefault();

    if (!email) {
      alert('Please provide an email.');
      return;
    }

    try {
      await axiosInstance.get(
        `survey/download-survey-csv/?email=${encodeURIComponent(email)}`,
        {
          headers: {
            Authorization: `Token ${user.token}`,
          },
        }
      );
      setErrorMessaageEmail('');
      setSuccessMessageEmail('Sent!');
    } catch (error) {
      setSuccessMessageEmail('');
      setErrorMessaageEmail('Email failed to send.');
      console.error('Error sending email:', error);
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
      setFile(null);
      setImportModalVisible(false);
      setErrorMessaage('');
      setSuccessMessage('');
    } catch (e) {
      setSuccessMessage("");
      if (e.response.status == 422) {
        setErrorMessaage("Invalid file format");
      } else {
        setErrorMessaage("Error uploading file");
      }
    }
  }

  const renderPagination = () => {
    const totalPages = Math.ceil(results.length / entriesPerPage) || 1;
    if (totalPages <= 1) return null;

    const pages = [];
    const maxPageNumbersToShow = 5;
    let startPage, endPage;

    if (totalPages <= maxPageNumbersToShow) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 3) {
        startPage = 1;
        endPage = 4;
      } else if (currentPage >= totalPages - 2) {
        startPage = totalPages - 3;
        endPage = totalPages;
      } else {
        startPage = currentPage - 1;
        endPage = currentPage + 1;
      }
    }

    if (startPage > 1) {
      pages.push(
        <TouchableOpacity
          key={1}
          onPress={() => setCurrentPage(1)}
          style={styles.pageNumber}
        >
          <Text
            style={
              currentPage === 1
                ? styles.activePageNumberText
                : styles.pageNumberText
            }
          >
            1
          </Text>
        </TouchableOpacity>
      );
      if (startPage > 2) {
        pages.push(
          <Text key="start-ellipsis" style={styles.pageNumberText}>
            ...
          </Text>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <TouchableOpacity
          key={i}
          onPress={() => setCurrentPage(i)}
          style={styles.pageNumber}
        >
          <Text
            style={
              currentPage === i
                ? styles.activePageNumberText
                : styles.pageNumberText
            }
          >
            {i}
          </Text>
        </TouchableOpacity>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Text key="end-ellipsis" style={styles.pageNumberText}>
            ...
          </Text>
        );
      }
      pages.push(
        <TouchableOpacity
          key={totalPages}
          onPress={() => setCurrentPage(totalPages)}
          style={styles.pageNumber}
        >
          <Text
            style={
              currentPage === totalPages
                ? styles.activePageNumberText
                : styles.pageNumberText
            }
          >
            {totalPages}
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.paginationContainer}>
        {currentPage > 1 && (
          <TouchableOpacity
            onPress={() => setCurrentPage(currentPage - 1)}
            style={styles.pageNumber}
          >
            <Text style={styles.pageNumberText}>Previous</Text>
          </TouchableOpacity>
        )}
        {pages}
        {currentPage < totalPages && (
          <TouchableOpacity
            onPress={() => setCurrentPage(currentPage + 1)}
            style={styles.pageNumber}
          >
            <Text style={styles.pageNumberText}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };
  const totalPages = Math.ceil(results.length / entriesPerPage) || 1;
  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentEntries = results.slice(indexOfFirstEntry, indexOfLastEntry);

  const screenStyle = {
    backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor,
    color: theme === 'dark' ? darkTheme.color : lightTheme.color,
  };
  
  return (
    <View style={[{ flex: 1, backgroundColor: 'white' }, screenStyle]}>

      {renderReportModal()}
      {renderEmailModal()}
      {renderImportModal()}
      {renderFilterModal()}

      <TamaguiButton
        icon={<Menu color={screenStyle.color}/>}
        size="$4"
        circular
        onPress={() => setMenuOpen(!menuOpen)}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
          backgroundColor: 'rgba(0, 0, 0, 0)',
          zIndex: 10,
        }}
        hoverStyle={{
          backgroundColor: 'rgba(0, 0, 0, 0)',
          borderColor: 'rgba(0, 0, 0, 0)',
        }}
      />

      {menuOpen && (
        <View style={styles.sideMenu}>
          <TouchableOpacity
            onPress={() => {
              handleExport();
              setMenuOpen(false);
            }}
            style={styles.sideMenuItem}
          >
            <Text style={styles.sideMenuItemText}>Download as CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setEmailModalVisible(true);
              setMenuOpen(false);
            }}
            style={styles.sideMenuItem}
          >
            <Text style={styles.sideMenuItemText}>Email CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
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
              setMenuOpen(false);
            }}
            style={styles.sideMenuItem}
          >
            <Text style={styles.sideMenuItemText}>
              {reportGenerated ? 'Exit Report' : 'Generate Report'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
                downloadTemplate();
                setMenuOpen(false);
            }}
            style={styles.sideMenuItem}
          >
            <Text style={styles.sideMenuItemText}>Download Quarterly Report Template</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setImportModalVisible(true);
              setMenuOpen(false);
            }}
            style={styles.sideMenuItem}
          >
            <Text style={styles.sideMenuItemText}>Import CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setFilterModalVisible(true);
              setMenuOpen(false);
            }}
            style={styles.sideMenuItem}
          >
            <Text style={styles.sideMenuItemText}>Filter Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (isFilterApplied) {
                setSelectedType(initialSelectedType);
                setSelectedId(initialSelectedId);
                setIsFilterApplied(false);
                fetchEntries();
              }
              setMenuOpen(false);
            }}
            style={[
              styles.sideMenuItem,
              !isFilterApplied && styles.disabledMenuItem,
            ]}
            disabled={!isFilterApplied}
          >
            <Text
              style={[
                styles.sideMenuItemText,
                !isFilterApplied && styles.disabledMenuItemText,
              ]}
            >
              Reset Data View
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={[styles.entryContainer, screenStyle]}>
        <BarChart data={parsedResults} />
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Pie Chart', { data: parsedResults })
          }
        >
          <PieChart data={parsedResults} />
        </TouchableOpacity>
        <View style={{ paddingHorizontal: theme === 'dark' ? 0 : 10, borderColor: theme === 'dark' ? darkTheme.color : 'transparent', borderTopWidth: theme === 'dark' ? 3 : 0}}>
          {renderTableHeader()}
          {currentEntries.map(renderTableRow)}
          {renderPagination()}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  burgerMenu: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
  },
  burgerMenuText: {
    fontSize: 24,
    color: 'white',
  },
  sideMenu: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '70%',
    height: '100%',
    backgroundColor: 'white',
    zIndex: 9,
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  sideMenuItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  sideMenuItemText: {
    fontSize: 18,
  },
  disabledMenuItem: {
    opacity: 0.5,
  },
  disabledMenuItemText: {
    color: '#999',
  },
  closeMenuButton: {
    marginTop: 20,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeMenuButtonText: {
    color: '#007BFF',
    fontSize: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  rowEven: {
    backgroundColor: '#f0f0f0',
  },
  rowOdd: {
    backgroundColor: '#fff',
  },
  cell: {
    flex: 1,
    margin: 4,
    textAlign: 'center',
  },
  columnHeader: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 4,
  },
  entryContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  pageNumber: {
    marginHorizontal: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#eeeeee',
    borderRadius: 5,
  },
  pageNumberText: {
    fontSize: 16,
    color: '#007BFF',
  },
  activePageNumberText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
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
    width: '100%',
  },
  successMessage: {
    marginTop: 10,
    color: 'green',
  },
  errorMessage: {
    marginTop: 10,
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
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  emailInput: {
    width: '100%',
    marginRight: 10,
    paddingHorizontal: 5,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  tamaguiButton: {
    backgroundColor: "#007bff",
    color: '#fff',
  },
});

export default ResultsScreen;
