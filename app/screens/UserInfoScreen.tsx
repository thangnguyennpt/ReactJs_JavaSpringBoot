import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { getUserInfo } from "../../api/apiService";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const UserInfoScreen = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const data = await getUserInfo();
        setUserInfo(data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };
    fetchUserInfo();
  }, []);

  // Thiết lập header với nút quay lại
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
      ),
      headerTitle: "Thông tin người dùng", // Tiêu đề của header
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container}>
      {/* Thông tin người dùng */}
      <View style={styles.userInfoContainer}>
        <Text style={styles.userInfoLabel}>Tên: <Text style={styles.userInfoValue}>{userInfo?.firstName} {userInfo?.lastName}</Text></Text>
        <Text style={styles.userInfoLabel}>Email: <Text style={styles.userInfoValue}>{userInfo?.email}</Text></Text>
        <Text style={styles.userInfoLabel}>Số điện thoại: <Text style={styles.userInfoValue}>{userInfo?.mobileNumber}</Text></Text>
        <Text style={styles.userInfoLabel}>Địa chỉ: <Text style={styles.userInfoValue}>{userInfo?.street}</Text></Text>
      </View>

      {/* Nút chỉnh sửa thông tin */}
      <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate("EditProfile")}>
        <MaterialCommunityIcons name="account-edit" size={24} color="white" />
        <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.goBackButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  userInfoContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    margin: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userInfoLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5,
  },
  userInfoValue: {
    fontSize: 16,
    color: "#333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    margin: 15,
    elevation: 2,
  },
  editButtonText: {
    color: "white",
    fontSize: 16,
    marginLeft: 10,
  },
  backButton: {
    padding: 10,
  },
  goBackButton: {
    backgroundColor: '#3386FF', // Màu nền cho nút quay lại
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    padding: 10,
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default UserInfoScreen; 