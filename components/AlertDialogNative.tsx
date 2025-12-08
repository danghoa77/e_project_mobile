import React from "react";
import { Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

export default function AlertDialogNative({
  open,
  title,
  message,
  type = "default",
  onClose,
}: {
  open: boolean;
  title: string;
  message: string;
  type?: "success" | "error" | "default";
  onClose: () => void;
}) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay */}
      <View className="flex-1 bg-black/50 items-center justify-center px-6">
        {/* Dialog Box */}
        <View
          className="bg-[#FCF7F1] rounded-sm border border-neutral-300 p-6"
          style={{ width: width * 0.85 }}
        >
          {/* Title */}
          <Text className="text-neutral-900 text-sm font-extrabold uppercase tracking-widest mb-2">
            {title}
          </Text>

          {/* Message */}
          <Text className="text-neutral-600 text-base leading-6 mb-6">
            {message}
          </Text>

          {/* Button */}
          <TouchableOpacity
            onPress={onClose}
            className={`py-3 rounded-sm items-center ${
              type === "success" ? "bg-primary" : "bg-neutral-800"
            }`}
          >
            <Text className="text-white text-xs font-bold uppercase tracking-widest">
              Okay
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
