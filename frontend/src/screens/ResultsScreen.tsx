import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Alert
} from 'react-native';
import { Button as TamaguiButton, Text } from 'tamagui';
import { BarChart, PieChart, Select } from '@/components';
import { YStack } from 'tamagui';
import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { format, endOfDay, subMonths, subYears } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Menu } from '@tamagui/lucide-icons';
import { useThemeName } from 'tamagui';
import { lightTheme, darkTheme } from '../themes';
import { useToastController, useToastState, Toast } from "@tamagui/toast";

const ResultsScreen = ({ navigation }) => {
  const classificationOrder = [
    '1',
    '2',
    '3',
    '4',
    '5.1',
    '5.2',
    '6',
    '7',
    '8',
    '9',
    '10',
  ];

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
  const [hasPermission, setHasPermission] = useState(false);
  const [currentFilterName, setCurrentFilterName] = useState('');

  const toast = useToastController();
  const currentToast = useToastState();

  const { user } = useAuth();
  const theme = useThemeName();

  useEffect(() => {
    if (selectedId !== null) {
      fetchResults();
    }
  }, [selectedId]);

  useEffect(() => {
    // Fetch filters
    axiosInstance.get('/survey/filters/', {
      headers: {
        Authorization: `Token ${user.token}`,
      }
    })
      .then(response => setFilters(response.data))
      .catch(error => console.error('Error fetching filters:', error));

    // Fetch groups and check permissions
    axiosInstance.get('/users/groups/', {
      headers: {
        Authorization: `Token ${user.token}`,
      }
    })
      .then(async response => {
        setGroups(response.data);
        if (response.data.length > 0) {
          let hasAccessToAnyGroup = false;

          for (const group of response.data) {
            try {
              const permissionResponse = await axiosInstance.get(`users/get-user-profile/`, {
                params: {
                  group_id: group.id,
                  email: user.email
                },
                headers: { Authorization: `Token ${user.token}` }
              });

              const canView = permissionResponse.data.can_view || permissionResponse.data.is_admin;
              if (canView) {
                setSelectedId(group.id);
                setInitialSelectedId(group.id);
                setCurrentFilterName(group.name);
                setHasPermission(true);
                hasAccessToAnyGroup = true;
                break;
              }
            } catch (error) {
              console.error('Error checking group permissions:', error);
            }
          }

          if (!hasAccessToAnyGroup) {
            toast.show('No Access', {
              message: 'You do not have permission to view data from any groups'
            });
            setHasPermission(false);
            setSelectedId(null);
            setInitialSelectedId(null);
            setCurrentFilterName('');
            setSelectedType('filter');
            setInitialSelectedType('filter');
          }
        }
      })
      .catch((error) => {
        console.error('Error fetching groups:', error);
        toast.show('Error', {
          message: 'Failed to fetch groups'
        });
      });
  }, []);

  useEffect(() => {
    const processResultsForAnalysis = () => {
      const categoryData = {};

      // Initialize categoryData with zeros for all classifications
      classificationOrder.forEach((classification) => {
        categoryData[classification] = { responses: 0, csectionCount: 0 };
      });

      results.forEach((result) => {
        const { classification, csection } = result;
        if (!categoryData[classification]) {
          // If the classification is not in classificationOrder, you might want to handle it
          // For now, we'll skip it
          return;
        }
        categoryData[classification].responses += 1;
        if (csection) {
          categoryData[classification].csectionCount += 1;
        }
      });

      // Map over classificationOrder to ensure the data is in the desired order
      return classificationOrder.map((classification) => ({
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
      if (Platform.OS === 'web') {
        window.alert('Please select both start and end dates.');
      } else {
        Alert.alert('Error', 'Please select both start and end dates.');
      }
      return;
    }
    if (startDate > endDate) {
      if (Platform.OS === 'web') {
        window.alert('Start date cannot be after end date.');
      } else {
        Alert.alert('Error', 'Start date cannot be after end date.');
      }
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

  const handlePreviousQuarter = () => {
    const end = new Date();
    const start = subMonths(end, 3);
    setDateRange([start, end]);
  };

  const handlePreviousYear = () => {
    const end = new Date();
    const start = subYears(end, 1);
    setDateRange([start, end]);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MM/dd/yy');
  };

  const formatCSection = (csection) => {
    return csection ? 'Yes' : 'No';
  };


  const fetchResults = async () => {
    const prefix = selectedType === 'group' ? 'group-' : 'filter-';
    const endpoint = `/survey/entries/filter/${prefix}${selectedId}/`;
    if (selectedType === 'group') {
      const selectedGroup = groups.find(g => g.id === selectedId);
      if (selectedGroup) {
        setCurrentFilterName(selectedGroup.name);
      }
    } else {
      const selectedFilter = filters.find(f => f.id === selectedId);
      if (selectedFilter) {
        setCurrentFilterName(selectedFilter.name);
      }
    }

    try {
      const response = await axiosInstance.get(endpoint, {
        headers: { Authorization: `Token ${user.token}` }
      });
      setResults(response.data);
      setAllResults(response.data);
    } catch (error) {
      console.error(`Error fetching entries for ${selectedType}:`, error);
      toast.show('Error', {
        message: 'Failed to fetch results'
      });
    }
  };


  const renderReportModal = () => (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={[styles.modalBackground]}>
        <View style={[styles.modalContent, screenStyle]}>
          <Text style={[styles.modalTitle, screenStyle]}>Select Date Range</Text>
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
          <View style={[styles.modalButtons, screenStyle]}>
            <TouchableOpacity
              style={[styles.button]}
              onPress={handlePreviousQuarter}
            >
              <Text style={[styles.buttonText]}>Last 3 Months</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button]}
              onPress={handlePreviousYear}
            >
              <Text style={[styles.buttonText]}>Last 12 Months</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.modalButtons, screenStyle]}>
            <TouchableOpacity
              style={[styles.button]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={[styles.buttonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button]} onPress={handleSubmit}>
              <Text style={[styles.buttonText]}>Submit</Text>
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
      <View style={[styles.modalBackground]}>
        <View style={[styles.modalContent, screenStyle]}>
          <Text style={[styles.modalTitle, screenStyle]}>Email CSV</Text>
          <View style={[styles.inputContainer, screenStyle]}>
            <input
              placeholder={'Enter email'}
              style={styles.emailInput}
              onChange={handleTextChange}
              value={email}
            ></input>
          </View>
          <View style={[styles.modalButtons, screenStyle]}>
            <TouchableOpacity
              style={[styles.button]}
              onPress={() => setEmailModalVisible(false)}
            >
              <Text style={[styles.buttonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button]} onPress={handleEmail}>
              <Text style={[styles.buttonText]}>Submit</Text>
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
      <View style={[styles.modalBackground]}>
        <View style={[styles.modalContent, screenStyle]}>
          <Text style={[styles.modalTitle, screenStyle]}>Import CSV</Text>
          <View style={[styles.inputContainer]}>
            <input
              type="file"
              style={styles.fileInput}
              onChange={handleFileChange}
              accept=".csv, .xlsx"
            />
          </View>
          <View style={[styles.modalButtons, screenStyle]}>
            <TouchableOpacity
              style={[styles.button]}
              onPress={() => {
                setImportModalVisible(false);
                setErrorMessaage('');
                setSuccessMessage('');
              }}
            >
              <Text style={[styles.buttonText]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button]} onPress={handleUpload}>
              <Text style={[styles.buttonText]}>Submit</Text>
            </TouchableOpacity>
          </View>
          <Text
            style={[
              errorMessage.length === 0
                ? styles.successMessage
                : styles.errorMessage,
              , screenStyle]
            }
          >
            {errorMessage.length === 0 ? successMessage : errorMessage}
          </Text>
        </View>
      </View>
    </Modal>
  );

  const renderFilterModal = () => {

    const [tempType, setTempType] = useState(selectedType);
    const [tempId, setTempId] = useState(selectedId);

    const handleSubmit = async () => {
      console.log("is it not?", tempType, tempId);

      if (tempType === 'group') {
        try {
          const response = await axiosInstance.get(`users/get-user-profile/`, {
            params: {
              group_id: tempId,
              email: user.email
            },
            headers: { Authorization: `Token ${user.token}` }
          });

          const canView = response.data.can_view || response.data.is_admin;
          setHasPermission(canView);

          if (!canView) {
            toast.show('Access Denied', {
              message: 'You do not have permission to view results for this group'
            });
            setTempType(selectedType);
            setTempId(selectedId);
            setFilterModalVisible(false);
            return;
          }
        } catch (error) {
          console.error('Error checking permissions:', error);
          toast.show('Error', {
            message: 'Failed to verify permissions'
          });
          // Reset and close on error
          setTempType(selectedType);
          setTempId(selectedId);
          setFilterModalVisible(false);
          return;
        }
      }

      setSelectedType(tempType);
      setSelectedId(tempId);

      if (tempType === 'group') {
        const selectedGroup = groups.find(g => Number(g.id) === Number(tempId));
        if (selectedGroup) {
          setCurrentFilterName(selectedGroup.name);
        }
      } else {
        const selectedFilter = filters.find(f => Number(f.id) === Number(tempId));
        if (selectedFilter) {
          setCurrentFilterName(selectedFilter.name);
        }
      }

      setIsFilterApplied(true);
      setFilterModalVisible(false);
    };

    const handleCancel = () => {
      // Reset temporary selections
      setTempType(selectedType);
      setTempId(selectedId);
      setFilterModalVisible(false);
    };
    return (
      <Modal
        visible={filterModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalBackground}>
          <View style={[styles.modalContent, screenStyle]}>
            <Text style={[styles.modalTitle, screenStyle]}>Filter Data View</Text>
            <YStack gap="$4" padding="$4">
              <Select
                value={tempType}
                onValueChange={setTempType}
                items={[
                  { label: 'Group', value: 'group' },
                  { label: 'Configuration', value: 'filter' },
                ]}
              />
              <Select
                value={tempId}
                onValueChange={setTempId}
                items={(tempType === 'group' ? groups : filters).map(
                  (item) => ({
                    label: item.name,
                    value: item.id,
                  })
                )}
              />
            </YStack>

            <View style={[styles.modalButtons, screenStyle]}>
              <TouchableOpacity
                style={[styles.button]}
                onPress={handleCancel}
              >
                <Text style={[styles.buttonText]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button]}
                onPress={handleSubmit}
              >
                <Text style={[styles.buttonText]}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  const renderTableRow = (result, index) => (
    <View
      style={[
        styles.tableRow,
        index % 2 === 0 ? (theme === 'dark' ? screenStyle : styles.rowEven) : screenStyle,
      ]}
      key={`${result.id}-${index}`}
    >
      <Text style={[styles.cell, { color: screenStyle.color }]}>Group {result.classification}</Text>
      <Text style={[styles.cell, { color: screenStyle.color }]}>{formatCSection(result.csection)}</Text>
      <Text style={[styles.cell, { color: screenStyle.color }]}>{formatDate(result.date)}</Text>
    </View>
  );

  const renderTableHeader = () => (
    <View style={[styles.tableRow, { backgroundColor: theme === 'dark' ? screenStyle.backgroundColor : styles.rowEven.backgroundColor, borderColor: theme === 'dark' ? darkTheme.color : 'transparent', borderBottomWidth: theme === 'dark' ? 3 : 0 }]}>
      <Text style={[styles.columnHeader, { color: screenStyle.color }]}>Classification</Text>
      <Text style={[styles.columnHeader, { color: screenStyle.color }]}>C-Section</Text>
      <Text style={[styles.columnHeader, { color: screenStyle.color }]}>Date</Text>
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
      fetchResults();
      setFile(null);
      setImportModalVisible(false);
      setErrorMessaage('');
      setSuccessMessage('');
    } catch (e) {
      setSuccessMessage("");
      if (e.response.status === 422) {
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
    backgroundColor: theme === 'dark' ? '#2C2F33' : lightTheme.backgroundColor,
    color: theme === 'dark' ? darkTheme.color : lightTheme.color,
  };

  return (
    <View style={[{ flex: 1, backgroundColor: 'white' }, screenStyle]}>
      {currentFilterName ? (
        <Text
          paddingVertical="$2"
          paddingHorizontal="$4"
          fontSize="$6"
          fontWeight="bold"
        >
          {`${currentFilterName}'s Data`}
        </Text>
      ) : null} 
      {renderReportModal()}
      {renderEmailModal()}
      {renderImportModal()}
      {renderFilterModal()}

      <TamaguiButton
        icon={<Menu color={theme === 'dark' ? 'white' : 'black'} />}
        size="$4"
        circular
        onPress={() => setMenuOpen(!menuOpen)}
        style={{
          position: 'absolute',
          top: 5,
          right: 5,
          backgroundColor: theme === 'dark' ? '$gray3' : 'white',
          zIndex: 10,
          border: theme === 'dark' ? "1px solid white" : "1px solid grey"
        }}
        hoverStyle={{
          backgroundColor: theme === 'dark' ? '$gray4' : '$gray2',
          borderColor: theme === 'dark' ? 'white' : 'grey',
        }}
      />

      {menuOpen && (
        <View style={[styles.sideMenu, screenStyle]}>
          <TouchableOpacity
            onPress={() => {
              handleExport();
              setMenuOpen(false);
            }}
            style={styles.sideMenuItem}
          >
            <Text style={[styles.sideMenuItemText, screenStyle]}>Download as CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setEmailModalVisible(true);
              setMenuOpen(false);
            }}
            style={[styles.sideMenuItem, screenStyle]}
          >
            <Text style={[styles.sideMenuItemText, screenStyle]}>Email CSV</Text>
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
            style={[styles.sideMenuItem, screenStyle]}
          >
            <Text style={[styles.sideMenuItemText, screenStyle]}>
              {reportGenerated ? 'Exit Report' : 'Generate Report'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              downloadTemplate();
              setMenuOpen(false);
            }}
            style={[styles.sideMenuItem, screenStyle]}
          >
            <Text style={[styles.sideMenuItemText, screenStyle]}>Download Quarterly Report Template</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setImportModalVisible(true);
              setMenuOpen(false);
            }}
            style={[styles.sideMenuItem, screenStyle]}
          >
            <Text style={[styles.sideMenuItemText, screenStyle]}>Import CSV</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              setFilterModalVisible(true);
              setMenuOpen(false);
            }}
            style={[styles.sideMenuItem, screenStyle]}
          >
            <Text style={[styles.sideMenuItemText, screenStyle]}>Filter Data</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              if (isFilterApplied) {
                setSelectedType(initialSelectedType);
                setSelectedId(initialSelectedId);
                setIsFilterApplied(false);
                fetchResults();
              }
              setMenuOpen(false);
            }}
            style={[
              styles.sideMenuItem,
              !isFilterApplied && styles.disabledMenuItem,
              , screenStyle
            ]}
            disabled={!isFilterApplied}
          >
            <Text
              style={[
                styles.sideMenuItemText,
                !isFilterApplied && styles.disabledMenuItemText,
                , screenStyle
              ]}
            >
              Reset Data View
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView style={[styles.entryContainer, screenStyle]}>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Bar Chart', { data: parsedResults })
          }
        >
          <BarChart data={parsedResults} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Pie Chart', { data: parsedResults })
          }
        >
          <PieChart data={parsedResults} />
        </TouchableOpacity>
        <View style={{ paddingHorizontal: theme === 'dark' ? 0 : 10, borderColor: theme === 'dark' ? darkTheme.color : 'transparent', borderTopWidth: theme === 'dark' ? 3 : 0 }}>
          {renderTableHeader()}
          {currentEntries.map(renderTableRow)}
          {renderPagination()}
        </View>
      </ScrollView>
      {currentToast && !currentToast.isHandledNatively && (
        <Toast
          key={currentToast.id}
          duration={currentToast.duration}
          enterStyle={{ opacity: 0, scale: 0.5, y: -25 }}
          exitStyle={{ opacity: 0, scale: 1, y: -20 }}
          y={0}
          opacity={1}
          scale={1}
          animation="100ms"
          viewportName={currentToast.viewportName}
        >
          <YStack>
            <Toast.Title>{currentToast.title}</Toast.Title>
            {!!currentToast.message && (
              <Toast.Description>{currentToast.message}</Toast.Description>
            )}
          </YStack>
        </Toast>
      )}
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
    textAlign: 'center',
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
  quickSelectButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  quickSelectButton: {
    flex: 1,
    marginHorizontal: 5,
    marginVertical: 10,
    paddingVertical: 12,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
  },
  buttonContainer: {
    marginRight: 10,
  },
});

export default ResultsScreen;
