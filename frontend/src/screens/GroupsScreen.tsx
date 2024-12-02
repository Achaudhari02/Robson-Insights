import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import * as DocumentPicker from "expo-document-picker"
import { axiosInstance } from "@/lib/axios";
import { useAuth } from "@/hooks/useAuth";
import { Select, Checkbox, TextField } from "@/components";
import {
  Button,
  XStack,
  YStack,
  Dialog,
  Input,
  ScrollView,
  Popover,
  Text
} from "tamagui";
import { Info } from "@tamagui/lucide-icons";
import { useToastController, useToastState, Toast } from "@tamagui/toast";
import { Check, MoreVertical, Trash, UserPlus, Edit3, Upload } from "@tamagui/lucide-icons";
import Papa from 'papaparse';

const { width } = Dimensions.get('window');
const isTabletOrDesktop = width >= 768;
import { useThemeName } from 'tamagui';
import { lightTheme, darkTheme } from '../themes';


const GroupsScreen = ({ navigation }) => {
  const [groups, setGroups] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [groupUsers, setGroupUsers] = useState([]);
  const [configurationGroups, setConfigurationGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedConfiguration, setSelectedConfiguration] = useState(null);
  const { user } = useAuth();
  const [newMember, setNewMember] = useState("");
  const [isCreateGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const [isCreateConfigurationModalOpen, setCreateConfigurationModalOpen] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [newConfigurationName, setNewConfigurationName] = useState("");
  const [groupNameError, setGroupNameError] = useState("");
  const [configurationNameError, setConfigurationNameError] = useState("");
  const [groupsTooltipVisible, setGroupsTooltipVisible] = useState(false);
  const [configurationsTooltipVisible, setConfigurationsTooltipVisible] = useState(false);
  const [isLeaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);
  const [isAddMembersModalOpen, setAddMembersModalOpen] = useState(false);
  const [isUpdateNameModalOpen, setUpdateNameModalOpen] = useState(false);
  const [isGroupAdmin, setIsGroupAdmin] = useState(false);

  const groupsTooltipRef = useRef(null);
  const configurationsTooltipRef = useRef(null);


  const toast = useToastController();
  const currentToast = useToastState();
  const [checkedGroups, setCheckedGroups] = useState({});
  const theme = useThemeName();

  useEffect(() => {
    fetchGroups();
    fetchConfigurations();

    const handleClickOutside = (event) => {
      if (groupsTooltipRef.current &&
        !groupsTooltipRef.current.contains(event.target) &&
        !event.target.closest('[data-groups-info-button]')) {
        setGroupsTooltipVisible(false);
      }
      if (configurationsTooltipRef.current &&
        !configurationsTooltipRef.current.contains(event.target) &&
        !event.target.closest('[data-configs-info-button]')) {
        setConfigurationsTooltipVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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
  }, [selectedConfiguration, groups]);



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
      const response = await axiosInstance.get("survey/filters/", {
        headers: {
          Authorization: `Token ${user.token}`,
          "Content-Type": "application/json",
        },
      });
      const configurationData = response.data.map((configuration) => ({
        label: configuration.name,
        value: configuration.id,
      }));
      setConfigurations(configurationData);
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
      setIsGroupAdmin(response.data.find(u => u.username === user.email)?.is_admin || false);

    } catch (error) {
      console.error("Error fetching group users:", error);
    }
  };

  const fetchConfigurationGroups = async (configurationId) => {
    try {
      const response1 = await axiosInstance.get(
        `users/groups-can-view/`,
        {
          headers: { Authorization: `Token ${user.token}` },
        }
      );
      const response2 = await axiosInstance.get(
        `survey/filters/${configurationId}/`,
        {
          headers: { Authorization: `Token ${user.token}` },
        }
      );
      setConfigurationGroups(response1.data);
      const initialCheckedState = response1.data.reduce((acc, group) => {
        acc[group.id] = response2.data.includes(group.id);
        return acc;
      }, {});
      setCheckedGroups(initialCheckedState);
    } catch (error) {
      console.error("Error fetching configuration groups:", error);
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
        "survey/create-configuration/",
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

  const massAddMembers = async (newMembers) => {
    if (!newMembers || !selectedGroup) return;
    try {
      await axiosInstance.post(
        `users/mass-invite/${selectedGroup}/`,
        { emails: newMembers, group_id: Number(selectedGroup) },
        { headers: { Authorization: `Token ${user.token}` } }
      );
      toast.show('Members added successfully', {
        message: `$All members have been invited to the group.`,
      });
    } catch (error) {
      toast.show('Failed to add members', {
        message: `An error occurred while inviting the members. ${error}`,
      });
    }
  };


  const addGroup = async (id: Number) => {
    if (!selectedConfiguration) return;
    try {
      await axiosInstance.post(
        `survey/add-group-to-configuration/`,
        { group_id: id, configuration_id: Number(selectedConfiguration) },
        { headers: { Authorization: `Token ${user.token}` } }
      );
      fetchConfigurationGroups(selectedConfiguration);
      toast.show('Group added successfully', {
        message: `$Group has been added to the configuration.`,
      });
    } catch (error) {
      console.error('Error adding group:', error);
      toast.show('Failed to add group', {
        message: 'An error occurred while adding the group.',
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

  const handleLeaveGroup = async () => {
    try {
      await axiosInstance.post(
        'users/leave-group/',
        { group_id: Number(selectedGroup) },
        { headers: { Authorization: `Token ${user.token}` } }
      );
      setLeaveGroupDialogOpen(false);
      fetchGroups();
      setSelectedGroup(null);

    } catch (error) {
      console.error("Error leaving group:", error);
      throw error;
    }
  };

  const handleFileUpload = async () => {
    try {
      const csv = await DocumentPicker.getDocumentAsync({ type: "text/csv", copyToCacheDirectory: false });
      let emails = [];
      Papa.parse(await (await fetch(csv.assets[0].uri)).blob(), {
        complete: (results) => {
          const data = results.data;
          const isHeader = !isEmail(data[0][0]);

          for (let i = (isHeader ? 1 : 0); i < data.length; i++) {
            const email = data[i][0].trim().toLowerCase();

            if (isEmail(email)) {
              emails.push(email);
            }
          }

          massAddMembers(emails);
        },
        header: false,
      });
    } catch (e) {
      console.log(e);
    }
  };

  const isEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const removeGroup = async (group: Number) => {
    try {
      await axiosInstance.post(
        `survey/remove-group-from-configuration/`,
        { group_id: group, configuration_id: Number(selectedConfiguration) },
        { headers: { Authorization: `Token ${user.token}` } }
      );
      fetchConfigurationGroups(selectedConfiguration);
    } catch (error) {
      console.error("Error removing group:", error);
    }
  };

  const handleUserCheckBoxChange = async (username, newValue) => {
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

  const handleGroupCheckBoxChange = (id) => {
    if (checkedGroups[id]) {
      removeGroup(id);
    } else {
      addGroup(id);
    }

    setCheckedGroups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleGroupSelectChange = (value) => {
    if (value === 'create-group') {
      setCreateGroupModalOpen(true);
    } else {
      setSelectedGroup(value);
    }
  };

  const handleConfigurationSelectChange = (value) => {
    if (value === 'create-configuration') {
      setCreateConfigurationModalOpen(true);
    } else {
      setSelectedConfiguration(value);
    }
  };

  const screenStyle = {
    backgroundColor: theme === 'dark' ? darkTheme.backgroundColor : lightTheme.backgroundColor,
    color: theme === 'dark' ? darkTheme.color : lightTheme.color,
  };

  return (
    <ScrollView style={[{ flex: 1, backgroundColor: 'white' }, screenStyle]}>
      <XStack justifyContent="space-between" alignItems="flex-end" width="100%" paddingHorizontal="$5">
        <XStack flexDirection="row" justifyContent="center" alignItems="center" position="relative" zIndex={2001}>
          <Text style={styles.subtitle2}>Groups</Text>
          <View style={{ position: 'relative', paddingVertical: 10 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Button
                size="$4"
                backgroundColor="$colorTransparent"
                marginLeft="$2"
                data-groups-info-button
                onPress={() => setGroupsTooltipVisible(!groupsTooltipVisible)}
                icon={<Info color={theme === 'dark' ? darkTheme.color : lightTheme.color} />}
                chromeless
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    color: '$color',
                    marginLeft: -10
                  }}
                >
                  learn more
                </Text>
              </Button>
            </View>
            {groupsTooltipVisible && (
              <YStack
                position="absolute"
                zIndex={2000}
                elevation={4}
                top="100%"
                left="50%"
                width="100%"
                style={{ transform: [{ translateX: -50 }] }}
              >
                <View style={styles.tooltip} ref={groupsTooltipRef}>
                  <View style={styles.arrow} />
                  <Text style={{ color: 'white' }}>Groups allow you to organize users. Users must accept your invitation.</Text>
                </View>
              </YStack>
            )}
          </View>
        </XStack>
      </XStack>
      <XStack justifyContent="space-between" alignItems="flex-end" width="100%" paddingHorizontal="$5">
        <View style={[styles.container, screenStyle]}>
          <XStack flex={1} alignItems="center" gap="$2">
            <Select
              items={[...groups, { label: 'Create Group', value: 'create-group' }]}
              value={selectedGroup}
              onValueChange={handleGroupSelectChange} />

            {selectedGroup && isGroupAdmin && (
              <Popover size="$5" allowFlip>
                <Popover.Trigger asChild>
                  <Button
                    icon={<MoreVertical size="$1" />}
                    circular
                    size="$3"
                    backgroundColor="$colorTransparent"
                    hoverStyle={{ backgroundColor: '$gray5' }}
                  />
                </Popover.Trigger>

                <Popover.Content
                  borderWidth={1}
                  borderColor="$borderColor"
                  enterStyle={{ y: -10, opacity: 0 }}
                  exitStyle={{ y: -10, opacity: 0 }}
                  elevate
                  animation={[
                    'quick',
                    {
                      opacity: {
                        overshootClamping: true,
                      },
                    },
                  ]}
                  width={width * 0.8}
                  maxWidth={400}
                  alignSelf="center"
                >
                  <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

                  <YStack space="$3" padding="$4">
                    <Button
                      onPress={() => setAddMembersModalOpen(true)}
                      icon={<UserPlus size={16} />}
                      size="$3"
                    >
                      Add Members Manually
                    </Button>
                    <Button
                      onPress={handleFileUpload}
                      icon={<Upload size={16} />}
                      size="$3"
                    >
                      Add Members Via CSV
                    </Button>
                    <Button
                      onPress={() => setUpdateNameModalOpen(true)}
                      icon={<Edit3 size={16} />}
                      size="$3"
                    >
                      Update Name
                    </Button>
                  </YStack>
                </Popover.Content>
              </Popover>
            )}
          </XStack>
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
            <YStack paddingVertical="$2">
              <Text style={[styles.subtitle, screenStyle]}>Group Members:</Text>
              {groupUsers.map((groupUser) => (
                <XStack
                  key={groupUser.id}
                  alignItems="center"
                  justifyContent="space-between"
                  width="100%"
                  paddingVertical="$2"
                  paddingHorizontal="$4"
                  gap="$4"
                  opacity={!isGroupAdmin ? 0.6 : 1}
                >
                  <XStack flex={1} minWidth={0}>  {/* Add this wrapper */}
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      flex={1}
                      minWidth={0}
                    >
                      {groupUser.username}
                    </Text>
                  </XStack>
                  {isTabletOrDesktop ? (
                    <XStack gap="$4" alignItems="center">
                      {isGroupAdmin && user.email !== groupUser.username && (
                        <Button
                          onPress={() => removeMember(groupUser.username)}
                          size="$3"
                          flexShrink={0}
                        >
                          Remove
                        </Button>
                      )}

                      <Text style={{ flexShrink: 0 }}>
                        Viewing permissions
                      </Text>

                      <Checkbox
                        checked={groupUser.can_view}
                        onCheckedChange={(newValue) =>
                          handleUserCheckBoxChange(groupUser.username, newValue)
                        }
                        size="$3"
                        flexShrink={0}
                        disabled={!isGroupAdmin}
                      />
                    </XStack>
                  ) : (
                    <>
                      {isGroupAdmin && (
                        <Popover placement="bottom-start" size="$5" allowFlip>
                          <Popover.Trigger asChild>
                            <Button
                              icon={<MoreVertical size="$1" />}
                              circular
                              size="$3"
                              backgroundColor="$colorTransparent"
                              hoverStyle={{ backgroundColor: '$gray5' }}
                            />
                          </Popover.Trigger>

                          <Popover.Content
                            borderWidth={1}
                            borderColor="$borderColor"
                            enterStyle={{ y: -10, opacity: 0 }}
                            exitStyle={{ y: -10, opacity: 0 }}
                            elevate
                            animation={[
                              'quick',
                              {
                                opacity: {
                                  overshootClamping: true,
                                },
                              },
                            ]}
                            width={width * 0.8}
                            alignSelf="center"
                          >
                            <Popover.Arrow borderWidth={1} borderColor="$borderColor" />

                            <XStack
                              space="$3"
                              padding="$3"
                              alignItems="center"
                              justifyContent="center"
                              width="100%"
                            >
                              {user.email !== groupUser.username && (
                                <Button
                                  onPress={() => removeMember(groupUser.username)}
                                  theme="red"
                                  size="$3"
                                  icon={<Trash size={16} />}
                                  chromeless
                                >
                                  <Text size="$2">Remove</Text>
                                </Button>
                              )}

                              <XStack space="$2" alignItems="center">
                                <Text size="$2">Can View</Text>
                                <Checkbox
                                  checked={groupUser.can_view}
                                  onCheckedChange={(newValue) => {
                                    handleUserCheckBoxChange(groupUser.username, newValue);
                                  }}
                                  size="$2"
                                />
                              </XStack>
                            </XStack>
                          </Popover.Content>
                        </Popover>
                      )}
                    </>
                  )}
                </XStack>
              ))}

            </YStack>
          )}
        </View>
        <View style={{ width: 42 }} />
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
            style={[styles.dialogContent, screenStyle]}
          >
            <Dialog.Title>Create Group</Dialog.Title>
            <br />
            <Input
              placeholder="Group Name"
              value={groupName}
              onChangeText={(text) => {
                setGroupName(text);
                if (text.length >= 5) {
                  setGroupNameError("");
                }
              }}
              style={[styles.input, screenStyle]}
            />
            {groupNameError ? (
              <Text style={[styles.errorText, screenStyle]}>{groupNameError}</Text>
            ) : null}
            <XStack space="$2" marginTop="$4" justifyContent="flex-end">
              <Button onPress={() => setCreateGroupModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onPress={createGroup}
                disabled={groupName.length < 5}
              >
                Submit
              </Button>
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
      <XStack justifyContent="space-between" alignItems="flex-end" width="100%" paddingHorizontal="$5" marginTop="$24">
        <XStack flexDirection="row" justifyContent="center" alignItems="center" position="relative" zIndex={2000}>
          <Text style={styles.subtitle2}>Configurations</Text>
          <View style={{ position: 'relative' }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Button
                size="$4"
                backgroundColor="$colorTransparent"
                marginLeft="$2"
                data-configs-info-button
                icon={<Info />}
                onPress={() => setConfigurationsTooltipVisible(!configurationsTooltipVisible)}
                chromeless
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Text
                  style={{
                    marginLeft: -10,
                    color: '$color'
                  }}
                >
                  learn more
                </Text>
              </Button>
            </View>
            {configurationsTooltipVisible && (
              <YStack
                position="absolute"
                zIndex={2000}
                elevation={4}
                top="100%"
                left="50%"
                style={{ transform: [{ translateX: -50 }] }}
              >
                <View style={styles.tooltip} ref={configurationsTooltipRef}>
                  <View style={styles.arrow} />
                  <Text style={{ color: 'white' }}>
                    Configurations allow you to organize groups for combined analysis. No need to send any invitations; this is just for you!
                  </Text>
                </View>
              </YStack>
            )}
          </View>
        </XStack>
        <View style={{ width: 42 }} />
      </XStack>
      <XStack justifyContent="space-between" alignItems="flex-end" width="100%" paddingHorizontal="$5">

        <View style={[styles.container, screenStyle]}>
          <Select
            items={[...configurations, { label: 'Create Configuration', value: 'create-configuration' }]}
            value={selectedConfiguration}
            onValueChange={handleConfigurationSelectChange}
          />
          {selectedConfiguration && (
            <YStack padding="$2" gap="$1">
              <Text style={[styles.subtitle, screenStyle]}>Configuration Groups:</Text>
              {configurationGroups.map((group) => (
                <XStack justifyContent="flex-start" gap="$3" key={group.id} style={screenStyle}>
                  <Text
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    minWidth={0}
                  >{group.name}</Text>
                  <Checkbox size="$3" checked={checkedGroups[group.id]} onCheckedChange={() => handleGroupCheckBoxChange(group.id)}>
                    <Checkbox.Indicator>
                      <Check />
                    </Checkbox.Indicator>
                  </Checkbox>
                </XStack>
              ))}
            </YStack>
          )}
        </View>
        <View style={{ width: 42 }} />
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
            style={[styles.dialogContent, screenStyle]}
          >
            <Dialog.Title style={screenStyle}>Create Configuration</Dialog.Title>
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
              style={[styles.input, screenStyle]}
            />
            {configurationNameError ? (
              <Text style={styles.errorText}>{configurationNameError}</Text>
            ) : null}
            <XStack space="$2" marginTop="$4" justifyContent="flex-end">
              <Button onPress={() => setCreateConfigurationModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onPress={createConfiguration}
                disabled={newConfigurationName.length < 5}
              >
                Submit
              </Button>
            </XStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
      <Dialog
        open={isLeaveGroupDialogOpen}
        onOpenChange={setLeaveGroupDialogOpen}
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
            bordered
            elevate
            key="content"
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            y={0}
            opacity={1}
            scale={1}
          >
            <YStack space="$4">
              <Dialog.Title>Leave Group</Dialog.Title>
              <Dialog.Description>
                Are you sure you want to leave this group? You'll need a new invitation to rejoin.
              </Dialog.Description>
              <XStack space="$3" justifyContent="flex-end">
                <Button
                  onPress={() => setLeaveGroupDialogOpen(false)}
                  backgroundColor="$gray8"
                  hoverStyle={{
                    backgroundColor: "$gray7",
                    opacity: 0.9
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleLeaveGroup}
                  backgroundColor="$red10"
                  color="white"
                  hoverStyle={{
                    backgroundColor: "$red9",
                    opacity: 0.9
                  }}
                >
                  Leave
                </Button>
              </XStack>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {/* Add Members Modal */}
      <Dialog open={isAddMembersModalOpen} onOpenChange={setAddMembersModalOpen}>
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
            bordered
            elevate
            key="content"
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            y={0}
            opacity={1}
            scale={1}
            width={width * 0.9}
            maxWidth={500}
          >
            <Dialog.Title>Add Members</Dialog.Title>
            <YStack space="$4" padding="$4">
              <Input
                placeholder="Member Email"
                value={newMember}
                onChangeText={setNewMember}
              />
              <Button onPress={addMember}>Add Member</Button>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>

      {/* Update Name Modal */}
      <Dialog open={isUpdateNameModalOpen} onOpenChange={setUpdateNameModalOpen}>
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
            bordered
            elevate
            key="content"
            animation={[
              'quick',
              {
                opacity: {
                  overshootClamping: true,
                },
              },
            ]}
            enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
            exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
            x={0}
            y={0}
            opacity={1}
            scale={1}
            width={width * 0.9}
            maxWidth={500}
          >
            <Dialog.Title>Update Group Name</Dialog.Title>
            <YStack space="$4" padding="$4" gap="$4">
              <Input
                placeholder="New Group Name"
                value={groupName}
                onChangeText={(text) => {
                  setGroupName(text);
                  if (text.length >= 5) {
                    setGroupNameError("");
                  }
                }}
              />
              {groupNameError ? (
                <Text style={styles.errorText}>{groupNameError}</Text>
              ) : null}
              <Button
                onPress={() => {
                  updateGroupName();
                  setUpdateNameModalOpen(false);
                }}
                disabled={groupName.length < 5}
              >
                Update Name
              </Button>
            </YStack>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    maxWidth: '100%',
    alignSelf: 'center',
    backgroundColor: 'white',
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: isTabletOrDesktop ? 20 : 0,
    paddingVertical: 2,
    gap: 10,
    flexWrap: 'wrap',
    width: isTabletOrDesktop ? '80%' : '100%',
    justifyContent: 'space-between', // Use space-between for better distribution
  },
  subtitle: {
    fontSize: width > 768 ? 20 : width > 480 ? 18 : 16, // Adjust font size for different screen sizes
    fontWeight: "bold",
    marginVertical: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    flex: 1,
    maxWidth: '100%', // Allow input to take full width
  },
  username: {
    flex: 1,
  },
  dialogContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: '90%', // Use percentage for width
    maxWidth: 400,
    alignSelf: "center",
  },
  errorText: {
    color: "red",
    marginTop: 5,
  },
  subtitle2: {
    fontSize: width > 768 ? 24 : width > 480 ? 22 : 20, // Adjust font size for different screen sizes
  },
  tooltip: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 5,
    width: width > 480 ? 250 : 200,
    maxWidth: '90%',
  },
  arrow: {
    position: 'absolute',
    top: -8, // Adjust this value to fine-tune arrow position
    left: '50%',
    transform: [{ translateX: -5 }], // Half of the borderWidth to center it
    borderWidth: 5,
    borderColor: 'transparent',
    borderBottomColor: '#333',
    borderStyle: 'solid',
    width: 0, // Add explicit width
    height: 0, // Add explicit height
  },
  tamaguiButton: {
    backgroundColor: "#007bff",
    color: '#fff',
  },
});

export default GroupsScreen;