import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet } from 'react-native';
import GroupSelector from '@/components/GroupSelector';

export default function Invitation() {
  const [fields, setFields] = useState([{ key: Date.now(), text: '' }]);

  const addField = () => {
    setFields([...fields, { key: Date.now(), text: '' }]);
  };

  const removeField = (key) => {
    setFields(fields.filter((field) => field.key !== key));
  };

  const updateField = (key, text) => {
    const updatedFields = fields.map((field) =>
      field.key === key ? { ...field, text } : field
    );
    setFields(updatedFields);
  };

  const handleAddUsers = () => {
    const usernames = fields.map((field) => field.text);
    // add users to groups
  };

  return (
    <View style={styles.container}>
      <GroupSelector />
      {fields.map((field, index) => (
        <View key={field.key} style={styles.row}>
          <TextInput
            style={styles.input}
            value={field.text}
            onChangeText={(text) => updateField(field.key, text)}
          />
          {fields.length === 1 && (
            <Button title="+" onPress={addField} />
          )}
          {fields.length > 1 && (
            <>
              <Button title="-" onPress={() => removeField(field.key)} />
              {index === fields.length - 1 && (
                <View style={styles.spacer} />
              )}
              {index === fields.length - 1 && (
                <Button title="+" onPress={addField} />
              )}
            </>
          )}
        </View>
      ))}

      <Button
        title="Add Users"
        onPress={handleAddUsers}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 20,
    maxWidth: 600,
    alignSelf: 'center'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    flex: 1,
    marginRight: 10,
    maxWidth: 400
  },
  spacer: {
    width: 10,
  },
});
