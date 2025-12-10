import { cartApi } from "@/api/cart";
import paymentApi from "@/api/payment";
import { router } from "expo-router";
import { useEffect } from "react";
import { toast } from "sonner-native";
export const OrderResultPage = () => {
  const handleOnSuccess = async () => {
    await cartApi.deleteCart();
  };
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);

    const momoQuery = {
      orderId: searchParams.get("orderId") || undefined,
      resultCode: searchParams.get("resultCode") || undefined,
      message: searchParams.get("message") || undefined,
      amount: searchParams.get("amount") || undefined,
      payType: searchParams.get("payType") || undefined,
    };

    const vnp_TxnRef = searchParams.get("vnp_TxnRef");
    const vnp_ResponseCode = searchParams.get("vnp_TransactionStatus");
    const vnp_Amount = searchParams.get("vnp_Amount");

    const formattedAmount =
      momoQuery.amount || vnp_Amount
        ? new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(
            Number(momoQuery.amount || vnp_Amount) / (vnp_Amount ? 100 : 1)
          )
        : undefined;

    if (momoQuery.orderId && momoQuery.resultCode) {
      paymentApi
        .momoUrlReturn(momoQuery.orderId, momoQuery.resultCode)
        .then(() => {
          if (momoQuery.resultCode === "0") {
            handleOnSuccess();
            toast.success(
              `Payment successful ${
                formattedAmount ? `(${formattedAmount})` : ""
              }`
            );
          } else {
            toast.error("Payment failed. Please try again.");
          }
          router.replace("/");
        })
        .catch(() => {
          toast.error("Payment verification error.");
          router.replace("/");
        });
    } else if (vnp_TxnRef && vnp_ResponseCode) {
      paymentApi
        .vnpayReturn(vnp_TxnRef, vnp_ResponseCode)
        .then(() => {
          if (vnp_ResponseCode === "00") {
            handleOnSuccess();
            toast.success(
              `Payment successful ${
                formattedAmount ? `(${formattedAmount})` : ""
              }`
            );
          } else {
            toast.error("Payment failed. Please try again.");
          }
          router.replace("/");
        })
        .catch(() => {
          toast.error("Payment verification error.");
          router.replace("/");
        });
    } else {
      toast.error("Payment failed.");
      router.replace("/");
    }
  }, [location.search]);
  return null;
};
