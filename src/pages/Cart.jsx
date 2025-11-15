import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaArrowLeft,
  FaPlus,
  FaMinus,
  FaTrash,
  FaShoppingCart,
  FaClock,
  FaMapMarkerAlt,
  FaTag,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import Swal from "sweetalert2";

export default function Cart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [deliveryOption, setDeliveryOption] = useState("now");
  const [selectedTime, setSelectedTime] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isCouponApplied, setIsCouponApplied] = useState(false);
  const [deliveryFee] = useState(15);

  // Available delivery times for "later" option
  const deliveryTimes = [
    "12:00 PM - 1:00 PM",
    "1:00 PM - 2:00 PM",
    "2:00 PM - 3:00 PM",
    "3:00 PM - 4:00 PM",
    "4:00 PM - 5:00 PM",
    "5:00 PM - 6:00 PM",
    "6:00 PM - 7:00 PM",
    "7:00 PM - 8:00 PM",
    "8:00 PM - 9:00 PM",
  ];

  // Available coupon codes
  const validCoupons = [
    { code: "WELCOME10", discount: 10 },
    { code: "FIRSTORDER", discount: 15 },
    { code: "CHICKEN20", discount: 20 },
    { code: "SAVE25", discount: 25 },
  ];

  // Sample cart data for demonstration - ALWAYS USED FOR DEMO
  const sampleCartItems = [
    {
      id: 1,
      name: "Classic Fried Chicken",
      category: "meals",
      price: 45.99,
      image:
        "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
      description:
        "Crispy golden fried chicken with our secret blend of 11 herbs and spices. Served with your choice of dipping sauce and fresh fries.",
      prepTime: "15-20 mins",
      quantity: 2,
    },
    {
      id: 2,
      name: "Spicy Chicken Wings",
      category: "meals",
      price: 35.99,
      image:
        "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=400&h=300&fit=crop",
      description:
        "Spicy buffalo wings tossed in our signature hot sauce. Perfectly crispy with just the right amount of heat.",
      prepTime: "10-15 mins",
      quantity: 1,
    },
    {
      id: 3,
      name: "Chocolate Milkshake",
      category: "drinks",
      price: 18.99,
      image:
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop",
      description:
        "Creamy chocolate milkshake topped with whipped cream and chocolate drizzle. The perfect sweet treat for any time of day.",
      prepTime: "5 mins",
      quantity: 1,
    },
    {
      id: 4,
      name: "Chicken Burger",
      category: "meals",
      price: 32.99,
      image:
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop",
      description:
        "Juicy chicken burger with fresh vegetables and our special sauce. Served with crispy golden fries.",
      prepTime: "10-12 mins",
      quantity: 1,
    },
  ];

  useEffect(() => {
    localStorage.removeItem("chickenOneCart");
    setCartItems(sampleCartItems);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id) => {
    Swal.fire({
      title: "Remove Item?",
      text: "Are you sure you want to remove this item from your cart?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, remove it!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== id));
        Swal.fire({
          title: "Removed!",
          text: "Item has been removed from your cart.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Please enter a coupon code!",
      });
      return;
    }

    const coupon = validCoupons.find(
      (c) => c.code.toLowerCase() === couponCode.trim().toLowerCase()
    );

    if (coupon) {
      setDiscount(coupon.discount);
      setIsCouponApplied(true);
      Swal.fire({
        icon: "success",
        title: "Coupon Applied!",
        text: `You got ${coupon.discount}% off your order!`,
        timer: 2000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "error",
        title: "Invalid Coupon",
        text: "The coupon code you entered is invalid or expired.",
      });
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscount(0);
    setIsCouponApplied(false);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateDiscountAmount = () => {
    return (calculateSubtotal() * discount) / 100;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const discountAmount = calculateDiscountAmount();
    return subtotal - discountAmount + deliveryFee;
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Cart is Empty",
        text: "Please add some items to your cart before checkout.",
      });
      return;
    }

    if (deliveryOption === "later" && !selectedTime) {
      Swal.fire({
        icon: "warning",
        title: "Select Delivery Time",
        text: "Please select a delivery time for your order.",
      });
      return;
    }

    // Prepare order data
    const orderData = {
      items: cartItems,
      subtotal: calculateSubtotal(),
      discount: discount,
      discountAmount: calculateDiscountAmount(),
      deliveryFee: deliveryFee,
      total: calculateTotal(),
      deliveryOption: deliveryOption,
      deliveryTime: deliveryOption === "later" ? selectedTime : "ASAP",
      couponCode: isCouponApplied ? couponCode : null,
    };

    // Here you would typically send the order to your backend
    console.log("Order Data:", orderData);

    Swal.fire({
      title: "Proceed to Checkout?",
      html: `
        <div class="text-left">
          <p><strong>Items:</strong> ${cartItems.length}</p>
          <p><strong>Subtotal:</strong> EGP ${calculateSubtotal().toFixed(
            2
          )}</p>
          ${
            discount > 0
              ? `<p><strong>Discount:</strong> ${discount}% (-EGP ${calculateDiscountAmount().toFixed(
                  2
                )})</p>`
              : ""
          }
          <p><strong>Delivery Fee:</strong> EGP ${deliveryFee.toFixed(2)}</p>
          <p><strong>Total:</strong> EGP ${calculateTotal().toFixed(2)}</p>
          <p><strong>Delivery:</strong> ${
            deliveryOption === "now" ? "ASAP" : selectedTime
          }</p>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Yes, Checkout!",
      cancelButtonText: "Review Order",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Order Placed!",
          text: "Your order has been placed successfully!",
          icon: "success",
          confirmButtonColor: "#E41E26",
        }).then(() => {
          navigate("/");
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] px-3 sm:px-4 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="bg-white/80 backdrop-blur-md rounded-full p-2 sm:p-3 text-[#E41E26] hover:bg-[#E41E26] hover:text-white transition-all duration-300 shadow-lg"
            >
              <FaArrowLeft size={18} className="sm:w-5 sm:h-5" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">
                Shopping Cart
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Review your order and proceed to checkout
              </p>
            </div>
          </div>
          <div className="text-right self-end sm:self-auto">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#E41E26]">
              {cartItems.reduce((total, item) => total + item.quantity, 0)}{" "}
              Items
            </div>
            <div className="text-gray-600 text-sm sm:text-base">
              in your cart
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <FaShoppingCart
                  className="text-[#E41E26] sm:w-6 sm:h-6"
                  size={18}
                />
                Order Items ({cartItems.length})
              </h2>

              <div className="space-y-3 sm:space-y-4">
                <AnimatePresence>
                  {cartItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl sm:rounded-2xl border border-[#FDB913]/30"
                    >
                      {/* Product Image and Details */}
                      <div className="flex gap-3 sm:gap-4 w-full sm:w-auto sm:flex-1">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg sm:rounded-xl object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="mb-1 sm:mb-2">
                            <h3 className="font-bold text-gray-800 text-base sm:text-lg">
                              {item.name}
                            </h3>
                          </div>
                          <p className="text-[#E41E26] font-bold text-base sm:text-lg mb-1 sm:mb-2">
                            EGP {item.price.toFixed(2)}
                          </p>
                          <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                            <FaClock className="text-[#E41E26]" size={12} />
                            <span>{item.prepTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity Controls, Total Price and Remove Button - All in one row on large screens */}
                      <div className="flex items-center justify-between w-full sm:w-auto sm:flex-nowrap gap-2 sm:gap-3 mt-3 sm:mt-0">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-1 sm:gap-2 bg-white rounded-lg sm:rounded-xl p-1 sm:p-2 shadow-lg">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg hover:bg-gray-100 transition-colors duration-200 text-[#E41E26]"
                          >
                            <FaMinus size={10} className="sm:w-3 sm:h-3" />
                          </button>
                          <span className="font-bold text-gray-800 min-w-6 sm:min-w-8 text-center text-sm sm:text-base">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-md sm:rounded-lg hover:bg-gray-100 transition-colors duration-200 text-[#E41E26]"
                          >
                            <FaPlus size={10} className="sm:w-3 sm:h-3" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right min-w-20 sm:min-w-24">
                          <div className="font-bold text-gray-800 text-base sm:text-lg whitespace-nowrap">
                            EGP {(item.price * item.quantity).toFixed(2)}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.id)}
                          className="p-1 sm:p-2 text-red-500 hover:bg-red-50 rounded-md sm:rounded-lg transition-colors duration-200"
                        >
                          <FaTrash size={14} className="sm:w-4 sm:h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Delivery Options */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                <FaMapMarkerAlt
                  className="text-[#E41E26] sm:w-6 sm:h-6"
                  size={18}
                />
                Delivery Options
              </h2>

              <div className="space-y-3 sm:space-y-4">
                {/* Delivery Now */}
                <div
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl sm:rounded-2xl border border-[#FDB913]/30 cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setDeliveryOption("now")}
                >
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                      deliveryOption === "now"
                        ? "bg-[#E41E26] border-[#E41E26]"
                        : "border-gray-300"
                    }`}
                  >
                    {deliveryOption === "now" && (
                      <FaCheck className="text-white text-xs" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 text-sm sm:text-base">
                      Deliver Now
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Get your order as soon as possible
                    </div>
                  </div>
                  <div className="text-[#E41E26] font-bold text-sm sm:text-base">
                    ASAP
                  </div>
                </div>

                {/* Delivery Later */}
                <div
                  className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-[#fff8e7] to-[#ffe5b4] rounded-xl sm:rounded-2xl border border-[#FDB913]/30 cursor-pointer hover:shadow-lg transition-all duration-300"
                  onClick={() => setDeliveryOption("later")}
                >
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center ${
                      deliveryOption === "later"
                        ? "bg-[#E41E26] border-[#E41E26]"
                        : "border-gray-300"
                    }`}
                  >
                    {deliveryOption === "later" && (
                      <FaCheck className="text-white text-xs" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-800 text-sm sm:text-base">
                      Schedule Delivery
                    </div>
                    <div className="text-gray-600 text-xs sm:text-sm">
                      Choose your preferred delivery time
                    </div>
                  </div>
                </div>

                {/* Time Selection */}
                {deliveryOption === "later" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="p-3 sm:p-4 bg-white rounded-xl sm:rounded-2xl border border-gray-200"
                  >
                    <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                      Select Delivery Time
                    </label>
                    <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
                      {deliveryTimes.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                            selectedTime === time
                              ? "border-[#E41E26] bg-[#E41E26] text-white"
                              : "border-gray-200 bg-gray-50 text-gray-700 hover:border-[#E41E26] hover:bg-[#fff8e7]"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Order Summary - Fixed with full height and scrolling */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-xl sm:shadow-2xl p-4 sm:p-6 sticky top-4 h-fit max-h-[calc(100vh-2rem)] overflow-y-auto"
            >
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                Order Summary
              </h2>

              {/* Coupon Section */}
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-1 sm:mb-2">
                  Coupon Code
                </label>
                <div className="flex gap-1 sm:gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Try: WELCOME10"
                    disabled={isCouponApplied}
                    className="flex-1 border border-gray-200 bg-white text-black rounded-lg sm:rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base outline-none focus:ring-2 focus:ring-[#E41E26] focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  {isCouponApplied ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={removeCoupon}
                      className="bg-red-500 text-white px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                    >
                      <FaTimes size={12} className="sm:w-3.5 sm:h-3.5" />
                    </motion.button>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={applyCoupon}
                      className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-3 sm:px-4 rounded-lg sm:rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
                    >
                      <FaTag size={12} className="sm:w-3.5 sm:h-3.5" />
                    </motion.button>
                  )}
                </div>
                {isCouponApplied && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 sm:mt-2 p-2 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl text-green-700 text-xs sm:text-sm flex items-center gap-2"
                  >
                    <FaCheck className="text-green-500" size={12} />
                    <span>
                      {discount}% discount applied with {couponCode}
                    </span>
                  </motion.div>
                )}
                {!isCouponApplied && (
                  <p className="text-xs text-gray-500 mt-1">
                    Try: WELCOME10, FIRSTORDER, CHICKEN20, SAVE25
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">
                    Subtotal
                  </span>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    EGP {calculateSubtotal().toFixed(2)}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-600 text-sm sm:text-base">
                      Discount ({discount}%)
                    </span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base">
                      -EGP {calculateDiscountAmount().toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm sm:text-base">
                    Delivery Fee
                  </span>
                  <span className="font-semibold text-gray-800 text-sm sm:text-base">
                    EGP {deliveryFee.toFixed(2)}
                  </span>
                </div>

                <div className="border-t pt-3 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800 text-base sm:text-lg">
                      Total
                    </span>
                    <span className="font-bold text-[#E41E26] text-lg sm:text-xl md:text-2xl">
                      EGP {calculateTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCheckout}
                className="w-full bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Proceed to Checkout
              </motion.button>

              {/* Continue Shopping */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/")}
                className="w-full mt-3 sm:mt-4 border-2 border-[#E41E26] text-[#E41E26] py-2 sm:py-3 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base hover:bg-[#E41E26] hover:text-white transition-all duration-300"
              >
                Continue Shopping
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
