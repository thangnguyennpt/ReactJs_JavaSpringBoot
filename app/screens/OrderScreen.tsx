import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Order } from '../../api/apiService'; // Import hàm Order từ apiService

const OrderScreen = ({ route, navigation }) => {
  const { cartData, totalSum, userEmail, quantities } = route.params;

  const handleConfirmOrder = async () => {
    try {
      const paymentMethod = 'credit_card'; // Thay đổi theo phương thức thanh toán bạn muốn
      const response = await Order(userEmail, cartData.cartId, paymentMethod);
      Alert.alert("Thông báo", "Đơn hàng đã được xác nhận!", [
        { 
          text: "OK", 
          onPress: () => navigation.navigate("taborder") // Điều hướng đến ScreenOrdered
        }, 
      ]);
    } catch (error) {
      console.error("Error confirming order:", error);
      Alert.alert("Lỗi", "Không thể xác nhận đơn hàng. Vui lòng thử lại.");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Text style={styles.productName}>{item.productName}</Text>
      <Text style={styles.productQuantity}>x{item.quantity}</Text>
      <Text style={styles.productPrice}>
        {(item.price * item.quantity).toLocaleString()} VND
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đơn Hàng</Text>
      <FlatList
        data={cartData.products}
        keyExtractor={(item) => item.productId.toString()}
        renderItem={renderItem}
      />
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Tổng cộng:</Text>
        <Text style={styles.totalAmount}>
          {totalSum.toLocaleString()} VND
        </Text>
      </View>
      <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
        <Ionicons name="checkmark-circle-outline" size={24} color="white" />
        <Text style={styles.confirmButtonText}>Xác Nhận Đơn Hàng</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back" size={24} color="white" />
        <Text style={styles.goBackButtonText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  productName: {
    fontSize: 16,
    flex: 1,
  },
  productQuantity: {
    fontSize: 16,
    marginHorizontal: 10,
  },
  productPrice: {
    fontSize: 16,
    color: '#f87715',
  },
  totalContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#f87715',
  },
  confirmButton: {
    backgroundColor: '#f87715',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
  goBackButton: {
    backgroundColor: '#3386FF', // Màu nền cho nút quay lại
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  goBackButtonText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 10,
  },
});

export default OrderScreen;