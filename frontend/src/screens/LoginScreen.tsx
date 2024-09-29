import { useAuth } from "@/hooks/useAuth";
import React, { useEffect } from "react";
import { YStack, XStack, Text} from "tamagui";
import { useNavigation } from "@react-navigation/native";
import { ChevronLeft } from "@tamagui/lucide-icons";
import { Pressable } from "react-native";
import {Button, TextField} from "@/components";
import { Formik } from "formik";
import * as Yup from "yup";

const LoginScreen = () => {
  const { loginFn } = useAuth();
  const navigation = useNavigation();


  useEffect(() => {
    navigation.setOptions({
      header: () => <LoginHeader />,
    });
  }, [navigation]);

  const LoginHeader = () => {
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
          <Pressable onPress={() => navigation.navigate('Signup')}>
            <ChevronLeft size="$2" color="black" />
          </Pressable>{" "}
          <Text
            fontSize="$6"
            fontWeight="bold"
            style={{ flex: 1, textAlign: "center" }}
          >
            Already have an account?
          </Text>
          <YStack width="$4" />
        </XStack>
      </YStack>
    );
  };

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
  });


  const handleLogin = async (values) => {
    await loginFn(values.email, values.password);
  };

  return (
    <Formik
    initialValues={{ email: "", password: "" }}
    validationSchema={validationSchema}
    onSubmit={handleLogin}
  >
    {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
    <YStack flex={1} paddingHorizontal="$4" paddingTop="$2" background="$background">
      <YStack width="100%" space="$4">
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
         <YStack height="40%" />
        <Button
          onPress={handleSubmit}
          alignSelf="center"
          disabled={!values.email || !values.password || errors.email || errors.password}
          >
            Login
        </Button>
      </YStack>
    </YStack>
      )}
       </Formik>
  );
};

export default LoginScreen;
