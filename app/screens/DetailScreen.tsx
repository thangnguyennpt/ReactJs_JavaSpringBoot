import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { GET_IMG, addProductToCart } from "@/api/apiService";
import AsyncStorage from '@react-native-async-storage/async-storage';

const ScreenDetail = ({ navigation, route }) => {
  const { product } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [imageError, setImageError] = useState(false);

  const handleDecrease = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrease = () => {
    setQuantity(quantity + 1);
  };

  const handleAddToCart = async () => {
    const maxQuantity = 13; // Giới hạn số lượng tối đa

    if (quantity > maxQuantity) {
      Alert.alert("Lỗi", `Vui lòng đặt hàng số lượng ít hơn hoặc bằng ${maxQuantity}.`);
      return; // Dừng hàm nếu số lượng vượt quá giới hạn
    }

    const productToAdd = {
      productId: product.productId,
      quantity: quantity,
    };

    // Gọi API để thêm sản phẩm vào giỏ hàng
    try {
      const response = await addProductToCart(productToAdd);
      console.log("Thêm sản phẩm thành công:", response);

      // Lưu số lượng vào AsyncStorage
      const storedQuantities = await AsyncStorage.getItem("quantities");
      const quantities = storedQuantities ? JSON.parse(storedQuantities) : {};
      quantities[product.productId] = (quantities[product.productId] || 0) + quantity; // Cập nhật số lượng
      await AsyncStorage.setItem("quantities", JSON.stringify(quantities));

      // Điều hướng đến CartScreen và truyền dữ liệu
      navigation.navigate("Cart", { productId: product.productId, quantity: quantities[product.productId] });
    } catch (error) {
      console.error("Lỗi khi thêm vào giỏ hàng:", error);
      Alert.alert("Lỗi", "Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#230C02" />
          </TouchableOpacity>
        </View>

        <Image
          source={GET_IMG("products/image", product.image)}
          style={styles.productImage}
          onError={() => setImageError(true)}
        />
        {imageError && (
          <Image
            source={require("../../assets/images/dress1.png")}
            style={styles.productImage}
          />
        )}

        <View style={styles.detailCard}>
          <Text style={styles.productName}>{product.productName}</Text>
          <Text style={styles.productDescription}>{product.description}</Text>
          <Text style={styles.price}>${product.price}</Text>

          <View style={styles.sizeColorSection}>
            <Text style={styles.sizeLabel}>Select Size:</Text>
            <View style={styles.sizeOptions}>
              {['S', 'M', 'L', 'XL'].map(size => (
                <TouchableOpacity key={size} style={styles.sizeButton}>
                  <Text style={styles.sizeText}>{size}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.colorLabel}>Select Color:</Text>
            <View style={styles.colorOptions}>
              {['#D1C4E9', '#E1BEE7', '#BBDEFB'].map(color => (
                <TouchableOpacity key={color} style={[styles.colorButton, { backgroundColor: color }]} />
              ))}
            </View>
          </View>

          <View style={styles.cartSection}>
            <View style={styles.quantityPicker}>
              <TouchableOpacity style={styles.quantityButton} onPress={handleDecrease}>
                <Text style={styles.quantityText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityValue}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={handleIncrease}>
                <Text style={styles.quantityText}>+</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F7F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
  },
  productImage: {
    width: "100%",
    height: 400,
    borderRadius: 8,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  productName: {
    color: "#333333",
    fontSize: 24,
    fontWeight: "bold",
  },
  productDescription: {
    color: "#666666",
    fontSize: 16,
    marginTop: 5,
  },
  price: {
    color: "#333333",
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
  },
  sizeColorSection: {
    marginTop: 20,
  },
  sizeLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sizeOptions: {
    flexDirection: "row",
    marginBottom: 20,
  },
  sizeButton: {
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  sizeText: {
    color: "#333333",
  },
  colorLabel: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  colorOptions: {
    flexDirection: "row",
    marginBottom: 20,
  },
  colorButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  cartSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  quantityPicker: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333333",
    borderRadius: 10,
  },
  quantityButton: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    color: "#333333",
    fontSize: 20,
  },
  quantityValue: {
    color: "#333333",
    fontSize: 20,
    marginHorizontal: 10,
  },
  addToCartButton: {
    backgroundColor: "#FF5252",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  addToCartText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ScreenDetail;
