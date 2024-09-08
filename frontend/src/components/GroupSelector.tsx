import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import RNPickerSelect from 'react-native-picker-select';
// import axios from 'axios';

export default function GroupSelector() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    // Fetch groups where the user is an administrator
    // axios.get('')
    //   .then((response) => {
    //     const groupData = response.data.groups.map(group => ({ label: group, value: group }));
    //     setGroups(groupData);
    //   })
    //   .catch((error) => {
    //     console.log(error);
    //   });
  }, []);

  return (
    <View style={styles.container}>
      <Text>Select a Group:</Text>
      <RNPickerSelect
        onValueChange={(value) => setSelectedGroup(value)}
        items={groups}
        placeholder={{ label: "Select a group", value: null }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    marginBottom: 20,
  },
});