import React, { useEffect, useState } from "react";
import { Text, YStack, XStack } from "tamagui";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import { TextField, Button } from "@/components";
import { useNavigation } from "@react-navigation/native";
import { Formik } from "formik";
import * as Yup from "yup";
import { useAuth } from "@/hooks/useAuth";

const SignUpScreen = () => {

  const {registerFn} = useAuth()  
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      header: () => <SignupHeader />,
    });
  }, [navigation]);

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
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required")
  });


  const handleSignup = async (values) => {
    await registerFn(values.email, values.password);
  };
  return (
    <Formik
    initialValues={{firstName:"", lastName:"", email: "", password: "" }}
    validationSchema={validationSchema}
    onSubmit={handleSignup}
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

      {/*<YStack paddingTop="$4" alignItems="center">
        <Text fontSize="$2" color="$gray10">
          By selecting Agree and continue, I agree to Dynamic Layers{" "}
          <Text color="$blue9" textDecorationLine="underline">
            Terms of Service
          </Text>
          ,{" "}
          <Text color="$blue9" textDecorationLine="underline">
            Payments Terms of Service
          </Text>{" "}
          and acknowledge the{" "}
          <Text color="$blue9" textDecorationLine="underline">
            Privacy Policy
          </Text>
          .
        </Text>
      </YStack>*/}

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
