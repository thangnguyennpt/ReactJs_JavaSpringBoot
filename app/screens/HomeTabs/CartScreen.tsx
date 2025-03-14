import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import {
  Ionicons,
  AntDesign,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { SwipeListView } from "react-native-swipe-list-view";
import {
  GET_IMG,
  getCurrentCart,
  getCurrentUserEmail,
  getUserInfo,
  deleteCartItem,
} from "../../../api/apiService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TextInput } from "react-native-gesture-handler";

const CartScreen = ({ route, navigation }) => {
  const [cartData, setCartData] = useState(null);
  const [userEmail, setUserEmail] = useState("");

  // Thêm useEffect với focus listener
  useEffect(() => {
    loadCartData(); // Load lần đầu

    // Thêm listener để load lại khi màn hình được focus
    const unsubscribe = navigation.addListener("focus", () => {
      loadCartData();
    });

    // Cleanup listener khi component unmount
    return unsubscribe;
  }, [navigation]);

  const loadCartData = async () => {
    try {
      const email = await getCurrentUserEmail();
      setUserEmail(email);

      const userInfo = await getUserInfo();
      const cart = await getCurrentCart();

      const storedQuantities = await AsyncStorage.getItem("quantities");
      const quantities = storedQuantities ? JSON.parse(storedQuantities) : {};

      if (cart?.products) {
        cart.products = cart.products.map((product) => ({
          ...product,
          quantity: quantities[product.productId] || 1,
        }));
      }

      setCartData(cart);
    } catch (error) {
      console.error("Failed to load cart:", error);
      Alert.alert("Error", "Failed to load cart items");
    }
  };

  const handleDeleteItem = async (productId) => {
    try {
      const userInfo = await getUserInfo();
      await deleteCartItem(userInfo.cart.cartId, productId);
      // Reload cart after deletion
      loadCartData();
    } catch (error) {
      console.error("Failed to delete item:", error);
      Alert.alert("Error", "Failed to delete item from cart");
    }
  };

  const handleSwipeValueChange = (swipeData) => {
    const { key, value } = swipeData;
    if (value < -100) {
      handleDeleteItem(key);
    }
  };

  const calculateTotalPrice = () => {
    if (!cartData || !cartData.products) return 0;
    return cartData.products.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
  };

  const handleNext = async () => {
    if (cartData?.products?.length > 0) {
      // Tính tổng giá trị giỏ hàng
      const totalSum = calculateTotalPrice();

      // Điều hướng đến màn hình Order
      navigation.navigate("Order", {
        cartData,
        totalSum,
        userEmail,
        quantities: cartData.products.map((product) => ({
          productId: product.productId,
          quantity: product.quantity,
        })),
      });
    } else {
      Alert.alert("Thông báo", "Giỏ hàng trống");
    }
  };

  // Nhận dữ liệu từ DetailScreen
  useEffect(() => {
    if (route.params?.productId && route.params?.quantity) {
      const { productId, quantity } = route.params;
      // Cập nhật giỏ hàng với sản phẩm mới
      // Bạn có thể thêm logic để cập nhật giỏ hàng ở đây nếu cần
    }
  }, [route.params]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <SwipeListView
          data={cartData?.products || []}
          renderItem={(data) => {
            const imageUri = GET_IMG("products/image", data.item.image);
            const itemTotalPrice = data.item.price * data.item.quantity;

            return (
              <View style={styles.Productitem}>
                <Image
                  style={styles.image}
                  source={{ uri: imageUri }}
                  resizeMode="cover"
                  onError={() =>
                    console.log(
                      `Error loading image for ${data.item.productName}`
                    )
                  }
                />
                <View style={styles.Details}>
                  <Text style={styles.name}>{data.item.productName}</Text>
                  <Text style={styles.price}>
                    {itemTotalPrice.toLocaleString()} VND
                  </Text>
                  <Text style={styles.description}>
                    {data.item.description}
                  </Text>
                  <Text style={styles.quantity}>x{data.item.quantity}</Text>
                </View>
              </View>
            );
          }}
          renderHiddenItem={(data) => (
            <View style={styles.hiddenItem}>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleDeleteItem(data.item.productId)}
              >
                <AntDesign name="delete" size={24} color="white" />
              </TouchableOpacity>
            </View>
          )}
          rightOpenValue={-75}
          onSwipeValueChange={handleSwipeValueChange}
          keyExtractor={(item) => item.productId.toString()}
        />
      </View>

      <View style={styles.bottom}>
        <View style={styles.price}>
          <Text style={styles.totalPrice}>Total Price</Text>
          <Text style={styles.totalAmount}>
            {calculateTotalPrice().toLocaleString()} VND
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
        >
          <Ionicons name="cart-outline" size={25} color="#230C02" />
          <Text style={styles.next}>Next</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#EEDCC6",
  },
  top: {
    height: 50,
    backgroundColor: "#EEDCC6",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  content: {
    flex: 4,
    paddingHorizontal: 10,
  },
  Productitem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  image: {
    width: 100,
    height: 100,
    marginRight: 20,
  },
  Details: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
  },
  price: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  description: {
    fontSize: 14,
    color: "#999",
  },
  quantity: {
    marginTop: 10,
    fontSize: 14,
    color: "#555",
  },
  hiddenItem: {
    alignItems: "flex-end",
    backgroundColor: "#ff5e5e",
    justifyContent: "center",
    paddingHorizontal: 25,
    height: 90,
    borderRadius: 10,
    marginTop: 15,
    marginLeft: 200,
  },
  removeButton: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#ff5e5e",
    alignItems: "center",
    justifyContent: "center",
  },
  bottom: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  totalPrice: {
    fontSize: 16,
    color: "#f87715",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#f87715",
  },
  button: {
    backgroundColor: "#f87715",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  next: {
    color: "#230C02",
    fontSize: 18,
    marginLeft: 10,
  },
  searchRow: {
    flexDirection: "row",
    marginHorizontal: 20,
  },
  searchInput: {
    width: 333,
    height: 34,
    backgroundColor: "#EEDCC6",
    paddingLeft: 20,
    marginBottom: 10,
  },
  customButton: {
    backgroundColor: "#EEDCC6",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8, // Optional: Add rounded corners
  },
  buttonText: {
    color: "#230C02", // Change this to your desired text color
    fontSize: 16,
    fontWeight: "bold",
  },
  titleContainer: {
    height: 85,
  },
  titleText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#230C02",
    marginLeft: 20,
  },
  Text: {
    fontSize: 16,

    color: "#834D1E",
    marginLeft: 20,
  },
  icon: {
    color: "#FB452D",
    marginTop: 10,
  },
  num: {
    color: "#230C02",
    marginTop: 10,
    marginLeft: 10,
  },
});
