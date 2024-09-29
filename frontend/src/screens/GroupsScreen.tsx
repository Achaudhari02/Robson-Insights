import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text } from 'react-native';
import { axiosInstance } from '@/lib/axios';
import { useAuth } from '@/hooks/useAuth';
import { Select } from '@/components';
import { Button as TamaguiButton, Sheet, H4, XStack, YStack, Dialog, Input} from 'tamagui';
import { Menu } from '@tamagui/lucide-icons';

export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const {user, logoutFn} = useAuth();
  const [newMember, setNewMember] = useState('');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [groupNameError, setGroupNameError] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupUsers(selectedGroup);
    }
  }, [selectedGroup]);

  const fetchGroups = async () => {
    try {
      const response = await axiosInstance.get('users/groups/', {
        headers: { 'Authorization': `Token ${user.token}` }
      });
      const groupData = response.data.map(group => ({ label: group.name, value: group.id }));
      setGroups(groupData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const fetchGroupUsers = async (groupId) => {
    try {
      const response = await axiosInstance.get(`users/get-groups-users/${groupId}/`, {
        headers: { 'Authorization': `Token ${user.token}` }
      });
      setGroupUsers(response.data);
    } catch (error) {
      console.error('Error fetching group users:', error);
    }
  };

  const createGroup = async () => {
    if (newGroupName.length < 5) {
      setGroupNameError('Group name must be at least 5 characters');
      return;
    }
    if (newGroupName.length > 100) {
      setGroupNameError('Group name cannot exceed 100 characters');
      return;
    }
    try {
      await axiosInstance.post(
        'users/create-group/',
        { group_name: newGroupName },
        {
          headers: {
            Authorization: `Token ${user.token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setCreateGroupModalOpen(false);
      setNewGroupName('');
      fetchGroups();
    } catch (error) {
      console.error('Error creating group:', error);
      setGroupNameError('Failed to create group');
    }
  };

  const addMember = async () => {
    if (!newMember || !selectedGroup) return;
    try {
      await axiosInstance.post(`users/add-user-to-group/`,
        { username: newMember, group_id: Number(selectedGroup) },
        { headers: { 'Authorization': `Token ${user.token}` } }
      );
      setNewMember('');
      fetchGroupUsers(selectedGroup);
    } catch (error) {
      console.error('Error adding member:', error);
    }
  };

  const removeMember = async (username : string) => {
    try {
      await axiosInstance.post(`users/remove-user-from-group/`,
        { username, group_id: Number(selectedGroup) },
        { headers: { 'Authorization': `Token ${user.token}` } }
      );
      fetchGroupUsers(selectedGroup);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };


  return (
    <View style={{ flex: 1 }}>
      <XStack >
        <TamaguiButton
          style={styles.groupJoinRequestsButton}
          icon={<Menu />}
          size="$4"
          circular
          onPress={() => setSidebarOpen(true)}
        />
        <TamaguiButton
          size="$4"
          backgroundColor="$blue10"
          color="white"
          borderRadius="$2"
          margin="$2"
          onPress={() => setCreateGroupModalOpen(true)}
        >
          Create Group
        </TamaguiButton>
      </XStack>
    <View style={styles.container}>
    <Select
      items={groups}
      value={selectedGroup}
      onValueChange={(value) => setSelectedGroup(value)}
    />

    {selectedGroup && (
      <>
        <Text style={styles.subtitle}>Group Members:</Text>
        {groupUsers.map((user) => (
          <View key={user.id} style={styles.row}>
            <Text style={styles.username}>{user.username}</Text>
            <Button title="Remove" onPress={() => removeMember(user.username)} />
          </View>
        ))}

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={newMember}
            onChangeText={setNewMember}
            placeholder="Enter username"
          />
          <Button title="Add Member" onPress={addMember} />
        </View>

        <Sheet
        modal
        open={isSidebarOpen}
        onOpenChange={setSidebarOpen}
        snapPoints={[0.4, 0.8]}
        zIndex={200000}
        dismissOnSnapToBottom
        animation="bouncy"
      >
        <Sheet.Frame>
          <Sheet.ScrollView>
            <YStack space="$3" padding="$4">
              <H4>Group Join Requests</H4>
              {joinRequests.length === 0 ? (
                <Text>No join requests</Text>
              ) : (
                joinRequests.map((request) => (
                  <XStack key={request.username} justifyContent="space-between" alignItems="center">
                    <Text>{request.username}</Text>
                    <XStack space="$2">
                      <TamaguiButton
                        size="$3"
                        /*onPress={() => handleJoinRequest(request.username, 'approve')}*/
                      >
                        Approve
                      </TamaguiButton>
                      <TamaguiButton
                        size="$3"
                        /* onPress={() => handleJoinRequest(request.username, 'decline')} */
                      >
                        Decline
                      </TamaguiButton>
                    </XStack>
                  </XStack>
                ))
              )}
            </YStack>
          </Sheet.ScrollView>
        </Sheet.Frame>
      </Sheet>

      </>
    )}
    </View>
    <Dialog open={isCreateGroupModalOpen} onOpenChange={setCreateGroupModalOpen}>
    <Dialog.Portal>
      <Dialog.Overlay
        key="overlay"
        animation="quick"
        opacity={0.5}
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="black"
      />
      <Dialog.Content
        key="content"
        bordered
        elevate
        style={styles.dialogContent}
      >
        <Dialog.Title>Create Group</Dialog.Title>
        <Input
          placeholder="Group Name"
          value={newGroupName}
          onChangeText={(text) => {
            setNewGroupName(text);
            if (text.length >= 5) {
              setGroupNameError('');
            }
          }}
          style={styles.input}
        />
        {groupNameError ? (
          <Text style={styles.errorText}>{groupNameError}</Text>
        ) : null}
        <XStack space="$2" marginTop="$4" justifyContent="flex-end">
          <TamaguiButton onPress={() => setCreateGroupModalOpen(false)}>
            Cancel
          </TamaguiButton>
          <TamaguiButton
            onPress={createGroup}
            disabled={newGroupName.length < 5}
          >
            Submit
          </TamaguiButton>
        </XStack>
      </Dialog.Content>
    </Dialog.Portal>
    </Dialog>
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
  groupJoinRequestsButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
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
  username: {
    flex: 1,
    marginRight: 10,
  },
  dialogContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignSelf: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
  },
});
