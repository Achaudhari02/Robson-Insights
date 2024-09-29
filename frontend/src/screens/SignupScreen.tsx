import React, { useEffect, useState } from "react";
import { Text, YStack, XStack } from "tamagui";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { TextField, Button } from "@/components";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/hooks/useAuth";
import { axiosInstance } from "@/lib/axios";

const SignUpScreen = ({ route }) => {
  const { registerFn } = useAuth();
  const navigation = useNavigation();
  const { token } = route.params;
  const [initialEmail, setInitialEmail] = useState("");

  useEffect(() => {
    navigation.setOptions({
      header: () => <SignupHeader />,
    });
  }, [navigation]);

  useEffect(() => {
    const fetchInvitation = async () => {
      try {
        const response = await axiosInstance.get(`/users/get-invitation/${token}/`);
        setInitialEmail(response.data.email);
      } catch (error) {
        console.error("Error fetching invitation:", error);
      }
    };

    if (token) {
      fetchInvitation();
    }
  }, [token]);

  const SignupHeader = () => {
    return (
      <YStack
        paddingTop="$6"
        paddingHorizontal="$4"
        height="$10"
        justifyContent="center"
        alignItems="center"
        borderBottomWidth={0}
        elevation={0}
        shadowOpacity={0}
        backgroundColor="$background"
      >
        <XStack width="100%" justifyContent="space-between" alignItems="center">
          <Pressable onPress={() => navigation.navigate("Login")}>
            <ChevronLeft size="$2" color="black" />
          </Pressable>{" "}
          <Text
            fontSize="$6"
            fontWeight="bold"
            style={{ flex: 1, textAlign: "center" }}
          >
            Sign Up
          </Text>
          <YStack width="$4" />
        </XStack>
      </YStack>
    );
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string(),
    lastName: Yup.string(),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });

  const handleSignup = async (values) => {
    await registerFn({
      email: values.email,
      password: values.password,
      firstName: values.firstName,
      lastName: values.lastName,
      token: token,
    });  
  };

  return (
    <Formik
      initialValues={{ firstName: "", lastName: "", email: initialEmail, password: "" }}
      validationSchema={validationSchema}
      onSubmit={handleSignup}
      enableReinitialize
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
        <YStack f={1} padding="$4" backgroundColor="$background">
          <YStack width="100%" gap="$4">
            <TextField
              value={values.firstName}
              onChangeText={handleChange("firstName")}
              onBlur={handleBlur("firstName")}
              placeholder="First Name"
              helperText={touched.firstName && errors.firstName ? errors.firstName : ""}
            />
            <TextField
              value={values.lastName}
              onChangeText={handleChange("lastName")}
              onBlur={handleBlur("lastName")}
              placeholder="Last Name"
              helperText={touched.lastName && errors.lastName ? errors.lastName : ""}
            />
            <TextField
              value={values.email}
              onChangeText={handleChange("email")}
              onBlur={handleBlur("email")}
              placeholder="Email"
              helperText={touched.email && errors.email ? errors.email : ""}
            />
            <TextField
              value={values.password}
              onChangeText={handleChange("password")}
              onBlur={handleBlur("password")}
              placeholder="Password"
              secureTextEntry
              helperText={touched.password && errors.password ? errors.password : ""}
            />
          </YStack>
          <YStack height="20%" />
          <Button
            disabled={!values.email || !values.password || !values.firstName || !values.lastName || errors.email || errors.password || errors.firstName || errors.lastName}
            onPress={handleSubmit}
          >
            Agree and Continue
          </Button>
        </YStack>
      )}
    </Formik>
  );
};

export default SignUpScreen;