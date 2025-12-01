import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaFire,
  FaClock,
  FaEdit,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaCheck,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import axiosInstance from "../api/axiosInstance";
import "../style/ProductDetails.css";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [isAdminOrRestaurantOrBranch, setIsAdminOrRestaurantOrBranch] =
    useState(false);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [isSticky, setIsSticky] = useState(false);

  const [addonsData] = useState([
    {
      id: 1,
      title: "درجة الحرارة",
      type: "single",
      options: [
        { id: 1, name: "حار", price: 0 },
        { id: 2, name: "بارد", price: 0 },
        { id: 3, name: "معتدل", price: 0 },
      ],
    },
    {
      id: 2,
      title: "الحجم",
      type: "single",
      options: [
        { id: 1, name: "صغير", price: 5 },
        { id: 2, name: "وسط", price: 10 },
        { id: 3, name: "كبير", price: 15 },
      ],
    },
    {
      id: 3,
      title: "الإضافات",
      type: "multiple",
      options: [
        { id: 1, name: "كبدة", price: 8 },
        { id: 2, name: "سجق", price: 6 },
        { id: 3, name: "بسطرمة", price: 12 },
        { id: 4, name: "جبنة", price: 5 },
        { id: 5, name: "زيتون", price: 3 },
      ],
    },
    {
      id: 4,
      title: "الصوص",
      type: "multiple",
      options: [
        { id: 1, name: "مايونيز", price: 2 },
        { id: 2, name: "كاتشب", price: 1 },
        { id: 3, name: "ثوم", price: 3 },
        { id: 4, name: "حار", price: 2 },
      ],
    },
  ]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsAdminOrRestaurantOrBranch(false);
          return;
        }

        const response = await axiosInstance.get("/api/Account/Profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const userData = response.data;
        const userRoles = userData.roles || [];

        const hasAdminOrRestaurantOrBranchRole =
          userRoles.includes("Admin") ||
          userRoles.includes("Restaurant") ||
          userRoles.includes("Branch");

        setIsAdminOrRestaurantOrBranch(hasAdminOrRestaurantOrBranchRole);
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setIsAdminOrRestaurantOrBranch(false);
      }
    };

    checkUserRole();
  }, []);

  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setLoading(true);

        if (location.state?.product) {
          setProduct(location.state.product);
          setLoading(false);
          return;
        }

        const response = await axiosInstance.get(`/api/MenuItems/Get/${id}`);
        const productData = response.data;

        const transformedProduct = {
          id: productData.id,
          name: productData.name,
          category: productData.category?.name?.toLowerCase() || "meals",
          categoryId: productData.category?.id,
          price: productData.basePrice,
          image: productData.imageUrl
            ? `https://restaurant-template.runasp.net/${productData.imageUrl}`
            : "https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop",
          ingredients: [],
          description: productData.description,
          isActive: productData.isActive,
          calories: productData.calories,
          preparationTimeStart: productData.preparationTimeStart,
          preparationTimeEnd: productData.preparationTimeEnd,
          availabilityTime: {
            alwaysAvailable: productData.isAllTime,
            startTime:
              productData.menuItemSchedules?.[0]?.startTime?.substring(0, 5) ||
              "",
            endTime:
              productData.menuItemSchedules?.[0]?.endTime?.substring(0, 5) ||
              "",
          },
          availabilityDays: {
            everyday: productData.isAllTime,
            specificDays:
              productData.menuItemSchedules?.map((schedule) =>
                getDayName(schedule.day)
              ) || [],
          },
          menuItemSchedules: productData.menuItemSchedules || [],
        };

        setProduct(transformedProduct);
      } catch (error) {
        console.error("Error fetching product details:", error);
        Swal.fire({
          icon: "error",
          title: "خطأ",
          text: "فشل في تحميل تفاصيل المنتج",
          timer: 2000,
          showConfirmButton: false,
        }).then(() => {
          navigate("/");
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, location.state, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      const cartSection = document.getElementById("cart-section");
      if (cartSection) {
        const rect = cartSection.getBoundingClientRect();
        setIsSticky(rect.top > 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const getDayName = (dayNumber) => {
    const days = [
      "الأحد",
      "الإثنين",
      "الثلاثاء",
      "الأربعاء",
      "الخميس",
      "الجمعة",
      "السبت",
    ];
    return days[dayNumber - 1] || "";
  };

  const toArabicNumbers = (num) => {
    const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return num.toString().replace(/\d/g, (digit) => arabicNumbers[digit]);
  };

  const incrementQuantity = () => setQuantity((prev) => prev + 1);
  const decrementQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddonSelect = (addonId, optionId, type) => {
    setSelectedAddons((prev) => {
      const newSelectedAddons = { ...prev };

      if (type === "single") {
        newSelectedAddons[addonId] = [optionId];
      } else {
        const currentSelections = newSelectedAddons[addonId] || [];

        if (currentSelections.includes(optionId)) {
          newSelectedAddons[addonId] = currentSelections.filter(
            (id) => id !== optionId
          );
        } else {
          newSelectedAddons[addonId] = [...currentSelections, optionId];
        }

        if (newSelectedAddons[addonId].length === 0) {
          delete newSelectedAddons[addonId];
        }
      }

      return newSelectedAddons;
    });
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;

    let total = product.price * quantity;

    Object.values(selectedAddons).forEach((optionIds) => {
      optionIds.forEach((optionId) => {
        addonsData.forEach((addon) => {
          const option = addon.options.find((opt) => opt.id === optionId);
          if (option) {
            total += option.price * quantity;
          }
        });
      });
    });

    return total;
  };

  const handleAddToCart = () => {
    if (!product.isActive) {
      toast.warning(`${product.name} غير متوفر حالياً`, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        rtl: true,
      });
      return;
    }

    const requiredAddons = addonsData.filter((addon) => addon.required);
    const missingRequiredAddons = requiredAddons.filter(
      (addon) => !selectedAddons[addon.id]
    );

    if (missingRequiredAddons.length > 0) {
      toast.warning(
        `يرجى اختيار ${missingRequiredAddons
          .map((addon) => addon.title)
          .join(" و ")}`,
        {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
          rtl: true,
        }
      );
      return;
    }

    const cartItem = {
      ...product,
      quantity,
      selectedAddons: { ...selectedAddons },
      totalPrice: calculateTotalPrice(),
      timestamp: new Date().getTime(),
    };

    const existingItemIndex = cart.findIndex(
      (item) =>
        item.id === product.id &&
        JSON.stringify(item.selectedAddons) === JSON.stringify(selectedAddons)
    );

    let updatedCart;

    if (existingItemIndex !== -1) {
      updatedCart = [...cart];
      updatedCart[existingItemIndex].quantity += quantity;
      updatedCart[existingItemIndex].totalPrice =
        updatedCart[existingItemIndex].quantity *
        (product.price +
          Object.values(selectedAddons).reduce((sum, optionIds) => {
            optionIds.forEach((optionId) => {
              addonsData.forEach((addon) => {
                const option = addon.options.find((opt) => opt.id === optionId);
                if (option) sum += option.price;
              });
            });
            return sum;
          }, 0));
    } else {
      updatedCart = [...cart, cartItem];
    }

    setCart(updatedCart);

    toast.success(
      `تم إضافة ${toArabicNumbers(quantity)} ${product.name} إلى سلة التسوق`,
      {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "light",
        rtl: true,
      }
    );

    setQuantity(1);
  };

  const handleEditProduct = () => {
    navigate("/products/edit", { state: { productId: product.id } });
  };

  const handleDeleteProduct = async () => {
    Swal.fire({
      title: "هل أنت متأكد؟",
      text: "لن تتمكن من التراجع عن هذا الإجراء!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#E41E26",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "نعم، احذفه!",
      cancelButtonText: "إلغاء",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axiosInstance.delete(`/api/MenuItems/Delete/${product.id}`);
          Swal.fire({
            title: "تم الحذف!",
            text: "تم حذف المنتج بنجاح",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          }).then(() => {
            navigate("/");
          });
        } catch (error) {
          console.error("Error deleting product:", error);
          Swal.fire({
            icon: "error",
            title: "خطأ",
            text: "فشل في حذف المنتج",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    });
  };

  const handleToggleActive = async () => {
    try {
      await axiosInstance.put(
        `/api/MenuItems/ChangeMenuItemActiveStatus/${product.id}`
      );

      setProduct({ ...product, isActive: !product.isActive });

      Swal.fire({
        icon: "success",
        title: "تم تحديث الحالة!",
        text: `تم ${product.isActive ? "تعطيل" : "تفعيل"} المنتج`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error updating product status:", error);
      Swal.fire({
        icon: "error",
        title: "خطأ",
        text: "فشل في تحديث حالة المنتج",
        timer: 2000,
        showConfirmButton: false,
      });
    }
  };

  const isArabic = (text) => {
    const arabicRegex = /[\u0600-\u06FF]/;
    return arabicRegex.test(text);
  };

  const navigateToCart = () => {
    navigate("/cart", { state: { cartItems: cart } });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E41E26]"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            المنتج غير موجود
          </h2>
          <button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[#fff8e7] to-[#ffe5b4] dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-colors duration-300">
      {/* Toast Container */}
      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />

      {cartCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white rounded-full p-3 sm:p-4 shadow-2xl z-40 cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={navigateToCart}
        >
          <div className="relative">
            <FaShoppingCart className="w-4 h-4 sm:w-6 sm:h-6" />
            <span className="absolute -top-2 -right-2 bg-white text-[#E41E26] rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-xs font-bold">
              {cartCount}
            </span>
          </div>
        </motion.div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl overflow-hidden">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[555px] object-contain"
              />

              <div
                className={`absolute top-3 md:top-4 right-3 md:right-4 px-3 py-1 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-semibold ${
                  product.isActive
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white"
                }`}
              >
                {product.isActive ? "نشط" : "غير نشط"}
              </div>

              {isAdminOrRestaurantOrBranch && (
                <div className="absolute top-3 md:top-4 left-3 md:left-4 flex flex-col sm:flex-row gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleToggleActive}
                    className={`p-2 md:p-3 rounded-xl shadow-lg transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm ${
                      product.isActive
                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                        : "bg-green-500 text-white hover:bg-green-600"
                    }`}
                  >
                    {product.isActive ? (
                      <FaTimesCircle className="text-sm md:text-base" />
                    ) : (
                      <FaCheckCircle className="text-sm md:text-base" />
                    )}
                    <span className="hidden sm:inline">
                      {product.isActive ? "تعطيل" : "تفعيل"}
                    </span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditProduct}
                    className="bg-blue-500 text-white p-2 md:p-3 rounded-xl shadow-lg hover:bg-blue-600 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                  >
                    <FaEdit className="text-sm md:text-base" />
                    <span className="hidden sm:inline">تعديل</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDeleteProduct}
                    className="bg-red-500 text-white p-2 md:p-3 rounded-xl shadow-lg hover:bg-red-600 transition-colors flex items-center gap-1 md:gap-2 text-xs md:text-sm"
                  >
                    <FaTrash className="text-sm md:text-base" />
                    <span className="hidden sm:inline">حذف</span>
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-6 mb-4 md:mb-6 h-auto lg:h-[555px] flex flex-col">
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto custom-scrollbar pr-2 pb-4">
                  <div className="mb-4 md:mb-6">
                    <h2
                      className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3 md:mb-4"
                      dir={isArabic(product.name) ? "rtl" : "ltr"}
                    >
                      {product.name}
                    </h2>

                    <p
                      className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed mb-4 md:mb-6"
                      dir={isArabic(product.description) ? "rtl" : "ltr"}
                    >
                      {product.description}
                    </p>

                    <div className="text-2xl md:text-3xl font-bold text-[#E41E26]">
                      {toArabicNumbers(product.price)} ج.م
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4 md:mb-6">
                    {product.calories && (
                      <div
                        className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 p-3 md:p-4 rounded-xl md:rounded-2xl text-center"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-center gap-2 mb-1 md:mb-2">
                          <FaFire className="text-orange-500 text-base md:text-lg" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">
                            السعرات الحرارية
                          </span>
                        </div>

                        <div className="text-orange-600 dark:text-orange-400 font-bold text-lg md:text-xl">
                          {toArabicNumbers(product.calories)} كالوري
                        </div>
                      </div>
                    )}

                    {(product.preparationTimeStart ||
                      product.preparationTimeEnd) && (
                      <div
                        className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-3 md:p-4 rounded-xl md:rounded-2xl text-center"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-center gap-2 mb-1 md:mb-2">
                          <FaClock className="text-blue-500 text-base md:text-lg" />
                          <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm md:text-base">
                            وقت التحضير
                          </span>
                        </div>

                        <div className="text-blue-600 dark:text-blue-400 font-bold text-base md:text-lg">
                          {product.preparationTimeStart &&
                          product.preparationTimeEnd
                            ? `${toArabicNumbers(
                                product.preparationTimeStart
                              )} - ${toArabicNumbers(
                                product.preparationTimeEnd
                              )} دقيقة`
                            : product.preparationTimeStart
                            ? `${toArabicNumbers(
                                product.preparationTimeStart
                              )} دقيقة`
                            : `${toArabicNumbers(
                                product.preparationTimeEnd
                              )} دقيقة`}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 md:space-y-6">
                    {addonsData.map((addon) => (
                      <div
                        key={addon.id}
                        className="bg-gray-50 dark:bg-gray-700/50 rounded-xl md:rounded-2xl p-3 md:p-4 border border-gray-200 dark:border-gray-600"
                        dir="rtl"
                      >
                        <div className="flex items-center justify-between mb-2 md:mb-3">
                          <h3 className="font-semibold text-base md:text-lg text-gray-800 dark:text-gray-200">
                            {addon.title}
                          </h3>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
                          {" "}
                          {addon.options.map((option) => {
                            const isSelected = selectedAddons[
                              addon.id
                            ]?.includes(option.id);
                            return (
                              <motion.button
                                key={option.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  handleAddonSelect(
                                    addon.id,
                                    option.id,
                                    addon.type
                                  )
                                }
                                className={`p-2 md:p-3 rounded-lg md:rounded-xl border-2 transition-all duration-200 flex items-center justify-between ${
                                  isSelected
                                    ? "border-[#E41E26] bg-red-50 dark:bg-red-900/20"
                                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-500"
                                }`}
                                dir="rtl"
                              >
                                <div className="flex items-center gap-1 md:gap-2">
                                  <span
                                    className={`font-medium text-sm md:text-base ${
                                      isSelected
                                        ? "text-[#E41E26]"
                                        : "text-gray-700 dark:text-gray-300"
                                    }`}
                                  >
                                    {option.name}
                                  </span>
                                  {isSelected && (
                                    <FaCheck className="text-[#E41E26] text-xs md:text-sm" />
                                  )}
                                </div>

                                {option.price > 0 && (
                                  <span className="text-xs md:text-sm text-green-600 dark:text-green-400 font-semibold">
                                    +{toArabicNumbers(option.price)} ج.م
                                  </span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div
              id="cart-section"
              className={`bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-4 md:p-6 transition-all duration-300 ${
                isSticky
                  ? "sticky bottom-4 z-10 lg:relative lg:bottom-0"
                  : "relative"
              }`}
            >
              <div
                className="flex flex-row items-center justify-between gap-4 mb-4 md:mb-6"
                dir="rtl"
              >
                <div
                  className="w-[95px] sm:w-auto flex items-center justify-between sm:justify-start gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg md:rounded-xl p-1.5 sm:p-3 flex-shrink-0 order-2 sm:order-1"
                  dir="ltr"
                >
                  <button
                    onClick={decrementQuantity}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <FaMinus className="text-sm" />
                  </button>

                  <span className="font-semibold text-base min-w-6 text-center dark:text-gray-200">
                    {toArabicNumbers(quantity)}
                  </span>

                  <button
                    onClick={incrementQuantity}
                    className="p-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                  >
                    <FaPlus className="text-sm" />
                  </button>
                </div>

                <div className="text-xl md:text-2xl font-bold text-[#E41E26] whitespace-nowrap text-center sm:text-right order-1 sm:order-2">
                  الإجمالي: {toArabicNumbers(calculateTotalPrice().toFixed(2))}{" "}
                  ج.م
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleAddToCart}
                disabled={!product.isActive}
                className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold text-lg md:text-xl hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 md:gap-4 ${
                  product.isActive
                    ? "bg-gradient-to-r from-[#E41E26] to-[#FDB913] text-white"
                    : "bg-gray-400 text-gray-200 cursor-not-allowed"
                }`}
                dir="rtl"
              >
                <FaShoppingCart className="text-lg md:text-xl" />

                {product.isActive
                  ? `أضف إلى السلة - ${toArabicNumbers(
                      calculateTotalPrice().toFixed(2)
                    )} ج.م`
                  : "المنتج غير متوفر"}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
