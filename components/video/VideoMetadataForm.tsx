import React, { useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VideoMetadataFormProps {
  onSubmit: (data: { title: string; description: string }) => void;
  isLoading?: boolean;
}

export default function VideoMetadataForm({
  onSubmit,
  isLoading = false,
}: VideoMetadataFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
  }>({});

  const validate = () => {
    const newErrors: { title?: string; description?: string } = {};

    if (!title.trim()) {
      newErrors.title = "Başlık gerekli";
    } else if (title.length < 3) {
      newErrors.title = "Başlık en az 3 karakter olmalıdır";
    }

    if (!description.trim()) {
      newErrors.description = "Açıklama gerekli";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({ title, description });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.formTitle}>Video Bilgileri</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Başlık</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputError]}
          value={title}
          onChangeText={setTitle}
          placeholder="Video başlığı"
          placeholderTextColor="#adb5bd"
          maxLength={100}
        />
        {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={[
            styles.input,
            styles.textArea,
            errors.description && styles.inputError,
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Video açıklaması"
          placeholderTextColor="#adb5bd"
          multiline
          numberOfLines={4}
          maxLength={500}
        />
        {errors.description && (
          <Text style={styles.errorText}>{errors.description}</Text>
        )}
        <Text style={styles.charCount}>{description.length}/500</Text>
      </View>

      <Pressable
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={isLoading}
      >
        {isLoading ? (
          <View style={styles.buttonContent}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.submitButtonText}>Kaydediliyor...</Text>
          </View>
        ) : (
          <View style={styles.buttonContent}>
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.submitButtonText}>Kaydet</Text>
          </View>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 32,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#212529",
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#212529",
  },
  inputError: {
    borderColor: "#dc3545",
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  errorText: {
    color: "#dc3545",
    fontSize: 14,
    marginTop: 4,
  },
  charCount: {
    fontSize: 12,
    color: "#6c757d",
    textAlign: "right",
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    elevation: 2,
    shadowColor: "#007AFF",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
