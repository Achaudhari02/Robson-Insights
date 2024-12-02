import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking, Alert } from 'react-native';
import { BarChart } from '@/components';
import { Info } from "@tamagui/lucide-icons";
import { useThemeName } from 'tamagui';
import { lightTheme, darkTheme } from '../themes';

const BarChartAnalysisScreen = ({ route }) => {
  const { data } = route.params;

  const [modalVisible, setModalVisible] = useState(false);

  const theme  = useThemeName();

  const groupDescriptions = {
    1: 'Nulliparous women with a term, single, cephalic pregnancy in spontaneous labor.',
    2: 'Nulliparous women with a term, single, cephalic pregnancy in induced labor or pre-labor cesarean.',
    3: 'Multiparous women without previous cesarean, with a term, single, cephalic pregnancy in spontaneous labor.',
    4: 'Multiparous women without previous cesarean, with a term, single, cephalic pregnancy in induced labor or pre-labor cesarean.',
    5: 'Multiparous women with at least one previous cesarean and a term, single, cephalic pregnancy.',
    6: 'Nulliparous women with a single, breech pregnancy.',
    7: 'Multiparous women with a single, breech pregnancy.',
    8: 'Women with multiple pregnancies (twins, triplets, etc.).',
    9: 'Women with a single pregnancy in a transverse or oblique lie.',
    10: 'Women with a preterm, single, cephalic pregnancy.',
  };

  const totalWomen = data.reduce((sum, item) => sum + item.responses, 0);
  const totalCS = data.reduce((sum, item) => sum + item.csectionCount, 0);

  const GroupStatistics = ({ item }) => {
    const groupSizePercentage = ((item.responses / totalWomen) * 100).toFixed(2);
    const groupCSRate = item.responses > 0 ? ((item.csectionCount / item.responses) * 100).toFixed(2) : "N/A";
    const groupContributionToCSRate = ((item.csectionCount / totalCS) * 100).toFixed(2);

    return (
      <View style={[styles.frame, {backgroundColor: theme === 'dark' ? screenStyle.backgroundColor : styles.frame.backgroundColor}]}>
        <Text style={[styles.groupTitle, {color: screenStyle.color}]}>{`Group ${item.classification}`}</Text>
        <Text style={[styles.statText, {color: screenStyle.color}]}>{`Total Women: ${item.responses}`}</Text>
        <Text style={[styles.statText, {color: screenStyle.color}]}>{`Number of CS: ${item.csectionCount}`}</Text>
        <Text style={[styles.statText, {color: screenStyle.color}]}>{`Group Size: ${groupSizePercentage}%`}</Text>
        <Text style={[styles.statText, {color: screenStyle.color}]}>{`Group CS Rate: ${groupCSRate}%`}</Text>
        <Text style={[styles.statText, {color: screenStyle.color}]}>{`Group Contribution to Overall CS Rate: ${groupContributionToCSRate}%`}</Text>
      </View>
    );
  };

  const GroupDescription = ({ groupNumber, description }) => (
    <View style={[styles.descriptionCard, screenStyle]}>
      <Text style={[styles.descriptionTitle, screenStyle]}>{`Group ${groupNumber}`}</Text>
      <Text style={[styles.descriptionText, screenStyle]}>{description}</Text>
    </View>
  );

  const screenStyle = {
    backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor,
    color: theme === 'dark' ? darkTheme.color : lightTheme.color,
  };

  const EXTERNAL_URL = 'https://www.who.int/publications/i/item/9789241513197';

  const openExternalLink = async () => {
    const supported = await Linking.canOpenURL(EXTERNAL_URL);
    if (supported) {
      await Linking.openURL(EXTERNAL_URL);
    } else {
      Alert.alert("Unable to open the link", `Don't know how to open this URL: ${EXTERNAL_URL}`);
    }
  };

  return (
    <View style={[styles.container, screenStyle]}>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.infoButton} onPress={() => setModalVisible(true)}>
          <Info size={28} color="#007AFF" />
        </TouchableOpacity>
        <BarChart data={data} />

        <View style={styles.frameContainer}>
          {data.map((item, index) => (
            <GroupStatistics key={index} item={item} />
          ))}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, {backgroundColor: theme === 'dark' ? screenStyle.backgroundColor : styles.modalContainer.backgroundColor}]}>
          <Text style={[styles.modalHeader, {color: screenStyle.color}]}>Group Descriptions</Text>
          <ScrollView style={styles.descriptionContainer}>
            {Object.entries(groupDescriptions).map(([key, description]) => (
              <GroupDescription key={key} groupNumber={key} description={description} />
            ))}
          </ScrollView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.closeButton]}
              onPress={openExternalLink}
            >
              <Text style={styles.closeButtonText}>Learn More</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 20,
  },
  scrollContainer: {
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  infoButton: {
    position: 'absolute',
    top: 5,
    left: 5,
    zIndex: 10,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  frameContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  frame: {
    width: '48%',
    padding: 15,
    backgroundColor: '#F0F4F8',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  statText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
  },
  descriptionContainer: {
    paddingHorizontal: 20,
  },
  descriptionCard: {
    padding: 15,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 15,
    elevation: 2,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#555',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    paddingTop: 60,
  },
  modalHeader: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    alignSelf: 'center',
    marginVertical: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    backgroundColor: '#007AFF',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default BarChartAnalysisScreen;