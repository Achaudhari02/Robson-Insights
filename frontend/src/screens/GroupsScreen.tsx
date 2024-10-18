import React, { useState, useEffect } from "react";
import { View, TextInput, Button, StyleSheet, Text } from "react-native";
import { axiosInstance } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { Select } from "@/components";
import {
  Button as TamaguiButton,
  Sheet,
  H4,
  XStack,
  YStack,
  Dialog,
  Input,
  Checkbox,
} from "tamagui";
import { Menu } from "@tamagui/lucide-icons";
import { useToastController, useToastState, Toast } from "@tamagui/toast";
import { Check } from "@tamagui/lucide-icons";

export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { user, logoutFn } = useAuth();
  const [newMember, setNewMember] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupNameError, setGroupNameError] = useState("");
  const toast = useToastController();
  const currentToast = useToastState();

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
      const response = await axiosInstance.get("users/groups/", {
        headers: { Authorization: `Token ${user.token}` },
      });
      const groupData = response.data.map((group) => ({
        label: group.name,
        value: group.id,
      }));
      setGroups(groupData);
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const fetchGroupUsers = async (groupId) => {
    try {
      const response = await axiosInstance.get(
        `users/get-groups-users/${groupId}/`,
        {
          headers: { Authorization: `Token ${user.token}` },
        }
      );
      setGroupUsers(response.data);
    } catch (error) {
      console.error("Error fetching group users:", error);
    }
  };

  const createGroup = async () => {
    if (groupName.length < 5) {
      setGroupNameError("Group name must be at least 5 characters");
      return;
    }
    if (groupName.length > 100) {
      setGroupNameError("Group name cannot exceed 100 characters");
      return;
    }
    try {
      await axiosInstance.post(
        "users/create-group/",
        { group_name: groupName },
        {
          headers: {
            Authorization: `Token ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCreateGroupModalOpen(false);
      setGroupName("");
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      setGroupNameError("Failed to create group");
    }
  };

  const updateGroupName = async () => {
    if (groupName.length < 5) {
      setGroupNameError("Group name must be at least 5 characters");
      return;
    }
    if (groupName.length > 100) {
      setGroupNameError("Group name cannot exceed 100 characters");
      return;
    }
    try {
      await axiosInstance.patch(
        `users/groups/${selectedGroup}/update/`,
        { name: groupName },
        {
          headers: {
            Authorization: `Token ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setGroupName("");
      fetchGroups();
      toast.show('Group name updated successfully', {
        message: `The group name has been updated to ${groupName}.`,
      });
    } catch (error) {
      console.error("Error updating group name:", error);
      setGroupNameError("Failed to update group name");
    }
  };
  
  const addMember = async () => {
    if (!newMember || !selectedGroup) return;
    try {
      await axiosInstance.post(
        `users/create-invitation/${selectedGroup}/`,
        { email: newMember, group_id: Number(selectedGroup) },
        { headers: { Authorization: `Token ${user.token}` } }
      );
      setNewMember("");
      fetchGroupUsers(selectedGroup);
      toast.show('Member added successfully', {
        message: `${newMember} has been invited to the group.`,
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast.show('Failed to add member', {
        message: 'An error occurred while inviting the member.',
      });
    }
  };

  const removeMember = async (username: string) => {
    try {
      await axiosInstance.post(
        `users/remove-user-from-group/`,
        { username, group_id: Number(selectedGroup) },
        { headers: { Authorization: `Token ${user.token}` } }
      );
      fetchGroupUsers(selectedGroup);
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleCheckBoxChange = async (username, newValue) => {
    try {
      await axiosInstance.post(
        "users/toggle-permissions/",
        {
          username: username,
          group_id: Number(selectedGroup),
          toggle_view: newValue,
        },
        { headers: { Authorization: `Token ${user.token}` } }
      );
      fetchGroupUsers(selectedGroup);
    } catch (error) {
      console.error("Error updating permissions:", error);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
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
        {selectedGroup && (
          <>
            <Text style={styles.subtitle}>Group Members:</Text>
            {groupUsers.map((user) => (
              <View key={user.id} style={styles.row}>
                <Text style={styles.username}>{user.username}</Text>
                <Button
                  title="Remove"
                  onPress={() => removeMember(user.username)}
                />
                <Text>{"Viewing permissions"}</Text>
                <Checkbox
                  defaultChecked={user.can_view}
                  onCheckedChange={(newValue) =>
                    handleCheckBoxChange(user.username, newValue)
                  }
                >
                  <Checkbox.Indicator>
                    <Check />
                  </Checkbox.Indicator>
                </Checkbox>
              </View>
            ))}
            <View style={styles.row}>
              <Input
                placeholder="New Group Name"
                value={groupName}
                onChangeText={(text) => {
                  setGroupName(text);
                  if (text.length >= 5) {
                    setGroupNameError("");
                  }
                }}
                style={styles.input}
              />
              <TamaguiButton onPress={updateGroupName} disabled={groupName.length < 5}>
                Update Name
              </TamaguiButton>
            </View>
            {groupNameError ? (
              <Text style={styles.errorText}>{groupNameError}</Text>
            ) : null}
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
                        <XStack
                          key={request.username}
                          justifyContent="space-between"
                          alignItems="center"
                        >
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
      <Dialog
        open={isCreateGroupModalOpen}
        onOpenChange={setCreateGroupModalOpen}
      >
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
              value={groupName}
              onChangeText={(text) => {
                setGroupName(text);
                if (text.length >= 5) {
                  setGroupNameError("");
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
                disabled={groupName.length < 5}
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
    alignSelf: 'center',
    backgroundColor: 'white',
  },
  groupJoinRequestsButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    flex: 1,
    marginRight: 10,
    maxWidth: 400,
  },
  spacer: {
    width: 10,
  },
  username: {
    flex: 1,
    marginRight: 10,
  },
  dialogContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignSelf: "center",
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
});
