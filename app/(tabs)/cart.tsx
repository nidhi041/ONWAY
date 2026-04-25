import { Colors } from '@/constants/theme';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Dimensions,
    ImageSourcePropType,
    Image as RNImage,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CartItem {
  id: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  quantity: number;
  image: ImageSourcePropType;
}

const SCREEN_WIDTH = Dimensions.get('window').width;

interface CartItemCardProps {
  item: any;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

const CartItemCard = ({ item, onQuantityChange, onRemove }: CartItemCardProps) => (
  <View style={styles.cartItemCard}>
    <View style={styles.itemImageContainer}>
      <RNImage source={item.image} style={styles.itemImage} />
    </View>
    <View style={styles.itemDetails}>
      <View style={styles.itemHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.itemBrand}>{item.brand}</Text>
          <Text style={[styles.itemName, { color: Colors.light.text }]}>{item.name}</Text>
          <Text style={styles.itemDescription}>{item.description}</Text>
        </View>
        <TouchableOpacity onPress={() => onRemove(item.id)}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.itemFooter}>
        <View style={styles.priceSection}>
          <Text style={styles.itemPrice}>₹{item.price}</Text>
          {item.originalPrice !== item.price && (
            <Text style={styles.itemOriginalPrice}>₹{item.originalPrice}</Text>
          )}
        </View>
        <View style={styles.quantityControl}>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => onQuantityChange(item.id, Math.max(1, item.quantity - 1))}
          >
            <Text style={styles.quantityBtnText}>−</Text>
          </TouchableOpacity>
          <Text style={[styles.quantityValue, { color: Colors.light.text }]}>
            {item.quantity}
          </Text>
          <TouchableOpacity
            style={styles.quantityBtn}
            onPress={() => onQuantityChange(item.id, item.quantity + 1)}
          >
            <Text style={styles.quantityBtnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </View>
);

export default function CartScreen() {
  const router = useRouter();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(id, quantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeFromCart(id);
  };

  const handleClearAll = () => {
    clearCart();
  };

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee = 0;
  const discountApplied = 2.5;
  const totalAmount = subtotal + deliveryFee - discountApplied;

  const itemCount = cartItems.length;

  return (
    <View style={[styles.container, { backgroundColor: Colors.light.background }]}>
      <View style={styles.topBar} />
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.backButton}>{'<'}</Text>
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: Colors.light.text }]}>
              Your Cart ({itemCount})
            </Text>
          </View>
          {itemCount > 0 && (
            <TouchableOpacity onPress={handleClearAll}>
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>

        {cartItems.length > 0 ? (
          <>
            {/* Delivery Info */}
            <View style={styles.deliverySection}>
              <View style={styles.deliveryIcon}>
                <Text style={styles.deliveryIconText}>🚚</Text>
              </View>
              <View style={styles.deliveryInfo}>
                <Text style={styles.deliveryTitle}>DELIVERING TO HOME</Text>
                <Text style={[styles.deliveryAddress, { color: Colors.light.text }]}>
                  Apt 4B, Central Park Heights
                </Text>
              </View>
              <View style={styles.deliveryTime}>
                <Text style={styles.deliveryTimeText}>15 MINS</Text>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.orderSection}>
              <Text style={[styles.sectionTitle, { color: Colors.light.text }]}>
                Order Items
              </Text>
              <Text style={styles.itemCount}>{cartItems.length} items</Text>

              {cartItems.map((item) => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onQuantityChange={handleQuantityChange}
                  onRemove={handleRemoveItem}
                />
              ))}
            </View>

            {/* Coupon Section */}
            <View style={styles.couponSection}>
              <View style={styles.couponHeader}>
                <Text style={styles.couponIcon}>🎟️</Text>
                <Text style={[styles.couponTitle, { color: Colors.light.text }]}>
                  Apply Coupon
                </Text>
              </View>
              <View style={styles.couponInput}>
                <TextInput
                  style={styles.couponField}
                  placeholder="Enter code (ONWAY30)"
                  placeholderTextColor="#ccc"
                  value={couponCode}
                  onChangeText={setCouponCode}
                />
                <TouchableOpacity style={styles.applyButton}>
                  <Text style={styles.applyButtonText}>APPLY</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Price Breakdown */}
            <View style={styles.priceBreakdown}>
              <Text style={[styles.breakdownTitle, { color: Colors.light.text }]}>
                Price Breakdown
              </Text>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: Colors.light.text }]}>
                  Subtotal
                </Text>
                <Text style={[styles.breakdownValue, { color: Colors.light.text }]}>
                  ₹{subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: Colors.light.text }]}>
                  Delivery Fee
                </Text>
                <Text style={styles.breakdownFree}>FREE</Text>
              </View>
              <View style={styles.breakdownRow}>
                <Text style={[styles.breakdownLabel, { color: Colors.light.text }]}>
                  Discount Applied
                </Text>
                <Text style={styles.breakdownDiscount}>
                  -₹{discountApplied.toFixed(2)}
                </Text>
              </View>
              <View style={styles.offerBox}>
                <Text style={styles.offerLabel}>OFFER</Text>
                <Text style={styles.offerText}>Extra ₹2.50 saved with ONWAY Flash!</Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { color: Colors.light.text }]}>
                  Total Amount
                </Text>
                <Text style={styles.totalValue}>₹{totalAmount.toFixed(2)}</Text>
              </View>
            </View>

            {/* Info Message */}
            <View style={styles.infoMessage}>
              <Text style={styles.infoText}>
                All items in your cart are handled with strict hygiene standards.
              </Text>
            </View>

            {/* Bottom Spacing */}
            <View style={styles.bottomSpacing} />
          </>
        ) : (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartIcon}>🛒</Text>
            <Text style={[styles.emptyCartText, { color: Colors.light.text }]}>
              Your cart is empty
            </Text>
            <TouchableOpacity
              style={styles.continueShopping}
              onPress={() => router.back()}
            >
              <Text style={styles.continueShoppingText}>Continue Shopping</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action */}
      {cartItems.length > 0 && (
        <View style={styles.bottomAction}>
          <View style={styles.totalPayRow}>
            <Text style={styles.youPayLabel}>YOU PAY</Text>
            <Text style={styles.youPayAmount}>₹{totalAmount.toFixed(2)}</Text>
          </View>
          <TouchableOpacity style={styles.checkoutButton} onPress={() => router.push('/checkout')}>
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            <Text style={styles.checkoutArrow}> →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    height: 12,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  clearAll: {
    fontSize: 12,
    color: '#0C63E4',
    fontWeight: '700',
  },
  deliverySection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  deliveryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryIconText: {
    fontSize: 24,
  },
  deliveryInfo: {
    flex: 1,
  },
  deliveryTitle: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '700',
    marginBottom: 2,
  },
  deliveryAddress: {
    fontSize: 13,
    fontWeight: '600',
  },
  deliveryTime: {
    backgroundColor: 'white',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryTimeText: {
    fontSize: 9,
    color: '#2196F3',
    fontWeight: '700',
  },
  orderSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  itemCount: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  cartItemCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  itemImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemBrand: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 11,
    color: '#999',
  },
  deleteIcon: {
    fontSize: 18,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2196F3',
  },
  itemOriginalPrice: {
    fontSize: 11,
    color: '#ccc',
    textDecorationLine: 'line-through',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  quantityBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.light.text,
  },
  quantityValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  couponSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  couponHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  couponIcon: {
    fontSize: 20,
  },
  couponTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  couponInput: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  couponField: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
    color: Colors.light.text,
  },
  applyButton: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#2196F3',
    fontSize: 11,
    fontWeight: '700',
  },
  priceBreakdown: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  breakdownLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  breakdownFree: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4CAF50',
  },
  breakdownDiscount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E53935',
  },
  offerBox: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 10,
    marginVertical: 12,
  },
  offerLabel: {
    fontSize: 10,
    color: '#2196F3',
    fontWeight: '700',
    marginBottom: 2,
  },
  offerText: {
    fontSize: 11,
    color: '#2196F3',
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    marginTop: 12,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#22C55E',
  },
  infoMessage: {
    marginHorizontal: 16,
    marginVertical: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
  },
  infoText: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 80,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 24,
  },
  continueShopping: {
    backgroundColor: '#0C63E4',
    borderRadius: 14,
    paddingHorizontal: 28,
    paddingVertical: 14,
    elevation: 3,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  continueShoppingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomAction: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    backgroundColor: Colors.light.background,
  },
  totalPayRow: {
    marginBottom: 12,
  },
  youPayLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 2,
  },
  youPayAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.light.text,
  },
  checkoutButton: {
    backgroundColor: '#0C63E4',
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0C63E4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '800',
  },
  checkoutArrow: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
});
