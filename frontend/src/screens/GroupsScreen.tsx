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
import { Menu, Info } from "@tamagui/lucide-icons";
import { useToastController, useToastState, Toast } from "@tamagui/toast";
import { Check } from "@tamagui/lucide-icons";


export default function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [configurationGroups, setConfigurationGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);
  const { user, logoutFn } = useAuth();
  const [newMember, setNewMember] = useState("");
  const [newGroup, setNewGroup] = useState("");
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [joinRequests, setJoinRequests] = useState([]);
  const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [isCreateConfigurationModalOpen, setCreateConfigurationModalOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newConfigurationName, setNewConfigurationName] = useState("");
  const [groupNameError, setGroupNameError] = useState("");
  const [configurationNameError, setConfigurationNameError] = useState("");
  const [groupsTooltipVisible, setGroupsTooltipVisible] = useState(false);
  const [configurationsTooltipVisible, setConfigurationsTooltipVisible] = useState(false);
  const toast = useToastController();
  const currentToast = useToastState();

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    fetchConfigurations();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchGroupUsers(selectedGroup);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedConfiguration) {
      fetchConfigurationGroups(selectedConfiguration);
    }
  }, [selectedConfiguration]);

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

  const fetchConfigurations = async () => {
    try {
      const response = await axiosInstance.get("users/configurations/", {
        headers: { Authorization: `Token ${user.token}` },
      });
      const configurationData = response.data.map((configuration) => ({
        label: configuration.name,
        value: configuration.id,
      }));
      setGroups(configurationData);
    } catch (error) {
      console.error("Error fetching configurations:", error);
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

  const fetchConfigurationGroups = async (configurationId) => {
    try {
      const response = await axiosInstance.get(
        `users/get-configurations-groups/${configurationId}/`,
        {
          headers: { Authorization: `Token ${user.token}` },
        }
      );
      setConfigurationGroups(response.data);
    } catch (error) {
      console.error("Error fetching configuration groups:", error);
    }
  };

  const createGroup = async () => {
    if (newGroupName.length < 5) {
      setGroupNameError("Group name must be at least 5 characters");
      return;
    }
    if (newGroupName.length > 100) {
      setGroupNameError("Group name cannot exceed 100 characters");
      return;
    }
    try {
      await axiosInstance.post(
        "users/create-group/",
        { group_name: newGroupName },
        {
          headers: {
            Authorization: `Token ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCreateGroupModalOpen(false);
      setNewGroupName("");
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      setGroupNameError("Failed to create group");
    }
  };

  const createConfiguration = async () => {
    if (newConfigurationName.length < 5) {
      setConfigurationNameError("Configuration name must be at least 5 characters");
      return;
    }
    if (newConfigurationName.length > 100) {
      setConfigurationNameError("Group name cannot exceed 100 characters");
      return;
    }
    try {
      await axiosInstance.post(
        "users/create-configuration/",
        { configuration_name: newConfigurationName },
        {
          headers: {
            Authorization: `Token ${user.token}`,
            "Content-Type": "application/json",
          },
        }
      );
      setCreateConfigurationModalOpen(false);
      setNewConfigurationName("");
      fetchConfigurations();
    } catch (error) {
      console.error("Error creating configuration:", error);
      setConfigurationNameError("Failed to create configuration");
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

  const addGroup = async () => {
    if (!newGroup || !selectedConfiguration) return;
    try {
      //post request here
      setNewGroup("");
      fetchConfigurationGroups(selectedConfiguration);
      toast.show('Group added successfully', {
        message: `${newGroup} has been added to the configuration.`,
      });
    } catch (error) {
      console.error('Error adding group:', error);
      toast.show('Failed to add group', {
        message: 'An error occurred while inviting the group.',
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

  const removeGroup = async (group: string) => {
    try {
      //post request here
      fetchConfigurationGroups(selectedConfiguration);
    } catch (error) {
      console.error("Error removing group:", error);
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
      <XStack justifyContent="space-between" alignItems="flex-end" width="100%" paddingHorizontal="$5">
          <TamaguiButton
            size="$4"
            backgroundColor="$blue10"
            color="white"
            borderRadius="$2"
            margin="$2"
            style={{ width: 180 }}
            onPress={() => setCreateGroupModalOpen(true)}
          >
            Create Group
        </TamaguiButton>
        <XStack flexDirection="row" justifyContent="center" alignItems="center">
          <Text style={styles.subtitle2}>Groups</Text>
          <View>
            <TamaguiButton
              icon={<Info />}
              size="$4"
              circular
              backgroundColor="$colorTransparent"
              marginLeft="$2"
              onPress={() => setGroupsTooltipVisible(!groupsTooltipVisible)}
            />
            {groupsTooltipVisible && (
            <View style={styles.tooltip}>
              <View style={styles.arrow} />
              <Text style={{ color: 'white' }}>Groups allow you to organize users. Users must accept your invitation.</Text>
            </View>
            )}
          </View>
        </XStack>
        <TamaguiButton
          icon={<Menu />}
          size="$4"
          circular
          onPress={() => setSidebarOpen(true)}
        />
      </XStack>
      <XStack justifyContent="space-between" alignItems="flex-end" width="100%" paddingHorizontal="$5">
      <View style={{width: 180}}/>
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
      <View style={{width: 42}}/>
      </XStack>
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
            <br />
            <Input
              placeholder="Group Name"
              value={newGroupName}
              onChangeText={(text) => {
                setNewGroupName(text);
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
                disabled={newGroupName.length < 5}
              >
                Submit
              </TamaguiButton>
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
      <XStack justifyContent="space-between" alignItems="flex-end" width="100%" paddingHorizontal="$5" marginTop="$24">
          <TamaguiButton
            size="$4"
            backgroundColor="$blue10"
            color="white"
            borderRadius="$2"
            margin="$2"
            style={{ width: 180 }}
            onPress={() => setCreateConfigurationModalOpen(true)}
          >
            Create Configuration
        </TamaguiButton>
        <XStack flexDirection="row" justifyContent="center" alignItems="center">
          <Text style={styles.subtitle2}>Configurations</Text>
          <View>
            <TamaguiButton
              icon={<Info />}
              size="$4"
              circular
              backgroundColor="$colorTransparent"
              marginLeft="$2"
              onPress={() => setConfigurationsTooltipVisible(!configurationsTooltipVisible)}
            />
            {configurationsTooltipVisible && (
            <View style={styles.tooltip}>
              <View style={styles.arrow} />
              <Text style={{ color: 'white' }}>Configurations allow you to organize groups for combined analysis. No need to send any invitations; this is just for you!</Text>
            </View>
            )}
          </View>
        </XStack>
        <View style={{width: 42}}/>
      </XStack>
      <XStack justifyContent="space-between" alignItems="flex-end" width="100%" paddingHorizontal="$5">
      <View style={{width: 180}}/>
      <View style={styles.container}>
        <Select
          items={configurations}
          value={selectedConfiguration}
          onValueChange={(value) => setSelectedConfiguration(value)}
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
        {selectedConfiguration && (
          <>
            <Text style={styles.subtitle}>Configuration Groups:</Text>
            {configurationGroups.map((group) => (
              <View key={group.id} style={styles.row}>
                <Text style={styles.username}>{group.name}</Text>
                <Button
                  title="Remove"
                  onPress={() => removeGroup(group.name)}
                />
              </View>
            ))}

            <View style={styles.row}>
              <TextInput
                style={styles.input}
                value={newGroup}
                onChangeText={setNewGroup}
                placeholder="Enter group name"
              />
              <Button title="Add Group" onPress={addGroup} />
            </View>
          </>
        )}
      </View>
      <View style={{width: 42}}/>
      </XStack>
      <Dialog
        open={isCreateConfigurationModalOpen}
        onOpenChange={setCreateConfigurationModalOpen}
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
            <Dialog.Title>Create Configuration</Dialog.Title>
            <br />
            <Input
              placeholder="Configuration Name"
              value={newConfigurationName}
              onChangeText={(text) => {
                setNewConfigurationName(text);
                if (text.length >= 5) {
                  setConfigurationNameError("");
                }
              }}
              style={styles.input}
            />
            {configurationNameError ? (
              <Text style={styles.errorText}>{configurationNameError}</Text>
            ) : null}
            <XStack space="$2" marginTop="$4" justifyContent="flex-end">
              <TamaguiButton onPress={() => setCreateConfigurationModalOpen(false)}>
                Cancel
              </TamaguiButton>
              <TamaguiButton
                onPress={createConfiguration}
                disabled={newConfigurationName.length < 5}
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
  subtitle2: {
    fontSize: 24,
  },
  tooltip: {
    position: 'absolute',
    left: '100%',
    top: '50%',
    transform: [{ translateY: -50 }],
    backgroundColor: '#333',
    padding: 10,
    marginTop: 20,
    borderRadius: 5,
    width: 300,
  },
  arrow: {
    position: 'absolute',
    top: 35,
    right: '100%',
    marginTop: -10,
    borderWidth: 5,
    borderColor: 'transparent',
    borderRightColor: '#333',
    borderStyle: 'solid',
  },
});
