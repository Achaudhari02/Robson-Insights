import { useAuth } from '@/hooks/useAuth';
import { axiosInstance } from '@/lib/axios';
import { format } from 'date-fns';
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';

// Define your questions and the logic to determine the next question or result
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

const ResultsScreen = ({ navigation}) => {
  const [results, setResults] = useState([]);
  const {user, logoutFn} = useAuth();

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button
          onPress={() => logoutFn()}
          title="Logout"
        />
      ),
    });
  }, [navigation]);

  useEffect(()=>{
   const fetchResults = async () => {
    try {
        const resp = await axiosInstance.get('/survey/entries/', {headers: {
          'Authorization': `Token ${user.token}`
        }});
        setResults(resp.data);
    } catch (error) {
      console.error('Error fetching survey results:', error);
    }
   }

   fetchResults();
  }, [])

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MM/dd/yy'); 
  };

  const formatCSection = (csection) => {
    return csection ? 'Yes' : 'No';
  };

  console.log("results", results)
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
    <ScrollView style={styles.container}>
      {renderTableHeader()}
      {results.map(renderTableRow)}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
      flex: 1,
      marginTop: 20,
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
  });
  

export default ResultsScreen;
