import React, {useState} from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Linking, Alert } from 'react-native';
import { PieChart } from '@/components';
import { Info } from "@tamagui/lucide-icons";
import { useThemeName } from 'tamagui';
import { lightTheme, darkTheme } from '../themes';

const PieChartAnalysisScreen = ({ route }) => {
  const { data } = route.params;
  const [modalVisible, setModalVisible] = useState(false);
  const  theme = useThemeName();
  const EXTERNAL_URL = 'https://www.who.int/publications/i/item/9789241513197';

  const groupDescriptions = {
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

  const screenStyle = {
    backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor,
    color: theme === 'dark' ? darkTheme.color : lightTheme.color,
  };

  const totalWomen = data.reduce((sum, item) => sum + item.responses, 0);
  const totalCS = data.reduce((sum, item) => sum + item.csectionCount, 0);

  const GroupStatistics = ({ item }) => {
    const groupSizePercentage = ((item.responses / totalWomen) * 100).toFixed(2);
    const groupCSRate = ((item.csectionCount / item.responses) * 100).toFixed(2);
    const groupContributionToCSRate = ((item.csectionCount / totalCS) * 100).toFixed(2);

    return (
      <View style={[styles.frame, {backgroundColor: theme === 'dark' ? screenStyle.backgroundColor : styles.frame.backgroundColor}]}>
        <Text style={[styles.groupTitle, {color: screenStyle.color}]}>{`Group ${item.classification}`}</Text>
        <Text style={[styles.statText, {color: screenStyle.color}]}>{`Total Women: ${item.responses}`}</Text>
        <Text style={[styles.statText, {color: screenStyle.color}]}>{`Number of CS: ${item.csectionCount}`}</Text>
        <Text style={[styles.statText, {color: screenStyle.color}]}>{`Group Size: ${groupSizePercentage}%`}</Text>
        <Text style={[styles.statText, {color: screenStyle.color}]}>{`Group CS Rate: ${item.responses > 0 ? groupCSRate : "N/A"}`}</Text>
        <Text style={[styles.statText, {color: screenStyle.color}]}>{`Group Contribution to Overall CS Rate: ${groupContributionToCSRate}%`}</Text>
      </View>
    );
  };

  const GroupDescription = ({ groupNumber, description }) => (
    <View style={[styles.descriptionCard, {backgroundColor: theme === 'dark' ? screenStyle.backgroundColor : styles.descriptionCard.backgroundColor}]}>
      <Text style={[styles.descriptionTitle, screenStyle]}>{`Group ${groupNumber}`}</Text>
      <Text style={[styles.descriptionText, screenStyle]}>{description}</Text>
    </View>
  );

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
      <ScrollView contentContainerStyle={[styles.scrollContainer, screenStyle]}>
          <TouchableOpacity style={[styles.infoButton, screenStyle]} onPress={() => setModalVisible(true)}>
            <Info size={28} color="#007AFF" />
          </TouchableOpacity>
          <PieChart data={data} />
        <View style={styles.legendContainer}>
          {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: getColor(index) }]} />
              <Text style={[styles.legendText, screenStyle]}>{`Group ${item.classification}`}</Text>
            </View>
          ))}
        </View>
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
        <View style={[styles.modalContainer, { backgroundColor: theme === 'dark' ? screenStyle.backgroundColor : styles.modalContainer.backgroundColor }]}>
          <Text style={[styles.modalHeader, { color: screenStyle.color }]}>Group Descriptions</Text>
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
          <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const getColor = (index) => {
  const colors = [
    '#FF8A8D', '#66C2B5', '#FD8B5A', '#50A0A4', '#FFD700',
    '#8A2BE2', '#FF4500', '#2E8B57', '#1E90FF', '#DA70D6'
  ];
  return colors[index % colors.length];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 10,
  },
  legendColor: {
    width: 10,
    height: 10,
    marginRight: 5,
  },
  legendText: {
    fontSize: 14,
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
    alignSelf: 'center',
  },
  statText: {
    fontSize: 14,
    marginBottom: 5,
    color: '#555',
    textAlign: 'left',
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

export default PieChartAnalysisScreen;