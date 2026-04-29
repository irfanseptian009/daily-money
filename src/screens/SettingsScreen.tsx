import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, ScrollView, StatusBar, Modal, FlatList, Switch, Image, Alert, TextInput, ImageBackground,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types";
import { useSettings, PrimaryColor, primaryPalettes } from "../context/SettingsContext";
import { usePremium } from "../context/PremiumContext";
import { useProfile, EMOJI_AVATARS } from "../context/ProfileContext";
import { t } from "../config/translations";
import { LANGUAGES } from "../config/translations";
import { CURRENCIES, getCurrencyByCode } from "../config/currencies";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const { currency, setCurrency, language, setLanguage, theme, setTheme, colors, primaryColor, setPrimaryColor, palette } = useSettings();
  const { isPremium } = usePremium();
  const { profile, setName, pickPhoto, takePhoto, setEmojiAvatar, removePhoto, getInitials } = useProfile();
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showEmojiModal, setShowEmojiModal] = useState(false);
  const [showPhotoSourceModal, setShowPhotoSourceModal] = useState(false);
  const [editName, setEditName] = useState(profile.name);

  const currencyInfo = getCurrencyByCode(currency);
  const isDark = theme === "dark";
  const panelBg = isDark ? "#0f172a" : "#ffffff";
  const panelBorder = isDark ? "#1f2937" : "#f1f5f9";
  const iconBg = isDark ? "#111827" : palette.bgLight;

  const renderSection = (title: string, children: React.ReactNode) => (
    <View className="mx-4 mb-6">
      <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-widest mb-3">
        {title}
      </Text>
      <View
        style={{
          backgroundColor: panelBg,
          borderColor: panelBorder,
          borderWidth: 1,
          shadowColor: palette.main,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
          elevation: 2,
        }}
        className="rounded-3xl overflow-hidden"
      >
        {children}
      </View>
    </View>
  );

  const renderRow = (label: string, value: string, onPress: () => void, icon: string, showChevron: boolean = true) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-4 py-4"
      style={{ borderBottomColor: panelBorder, borderBottomWidth: 0.5 }}
    >
      <View className="w-9 h-9 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: iconBg }}>
        <Text className="text-base">{icon}</Text>
      </View>
      <Text style={{ color: colors.text }} className="flex-1 text-[15px] font-semibold">{label}</Text>
      {value ? <Text style={{ color: palette.deep }} className="text-sm mr-2 font-semibold">{value}</Text> : null}
      {showChevron && <Text style={{ color: colors.textMuted }}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={{ backgroundColor: colors.bg }} className="flex-1">
      <StatusBar barStyle={colors.statusBar} backgroundColor={colors.bg} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}>

        {/* Profile Section */}
        <View className="mx-4 mb-6">

          <View
            style={{
              backgroundColor: panelBg,
              borderColor: panelBorder,
              borderWidth: 1,
              shadowColor: palette.main,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 10,
              elevation: 2,
            }}
            className="rounded-3xl overflow-hidden"
          >
            <ImageBackground
              source={require("../../assets/transaction.png")}
              style={{ flex: 1 }}
              imageStyle={{ opacity: 0.18 }}
              resizeMode="cover"
            >
              <View className="items-center py-6 px-4">
                {/* Avatar */}
                <TouchableOpacity
                  onPress={() => setShowPhotoSourceModal(true)}
                  activeOpacity={0.8}
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    overflow: "hidden",
                    borderWidth: 3,
                    borderColor: palette.main,
                    shadowColor: palette.main,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.3,
                    shadowRadius: 12,
                    elevation: 6,
                    marginBottom: 12,
                  }}
                >
                  {profile.photoUri ? (
                    profile.photoUri.startsWith("emoji:") ? (
                      <View
                        style={{
                          width: 74,
                          height: 74,
                          borderRadius: 37,
                          backgroundColor: palette.main,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 36 }}>{profile.photoUri.replace("emoji:", "")}</Text>
                      </View>
                    ) : (
                      <Image
                        source={{ uri: profile.photoUri }}
                        style={{ width: 74, height: 74, borderRadius: 37 }}
                      />
                    )
                  ) : (
                    <View
                      style={{
                        width: 74,
                        height: 74,
                        borderRadius: 37,
                        backgroundColor: palette.main,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontSize: 28, fontWeight: "900", letterSpacing: 1 }}>
                        {getInitials()}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>

                <Text style={{ color: colors.text }} className="text-lg font-black mb-1">
                  {profile.name || "User"}
                </Text>
                <Text style={{ color: colors.textMuted }} className="text-xs mb-4">
                  {language === "id" ? "Ketuk foto untuk mengganti" : "Tap photo to change"}
                </Text>

                {/* Action Buttons */}
                <View className="flex-row items-center" style={{ gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { setEditName(profile.name); setShowNameModal(true); }}
                    className="px-5 py-2.5 rounded-2xl flex-row items-center"
                    style={{
                      backgroundColor: palette.bgLight,
                      borderWidth: 1,
                      borderColor: palette.soft,
                    }}
                  >
                    <Text style={{ color: palette.deep }} className="text-xs font-bold">
                      ✏️ {language === "id" ? "Ubah Nama" : "Edit Name"}
                    </Text>
                  </TouchableOpacity>





                  {profile.photoUri && (
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert(
                          language === "id" ? "Hapus Foto" : "Remove Photo",
                          language === "id" ? "Yakin ingin menghapus foto profil?" : "Are you sure you want to remove your photo?",
                          [
                            { text: language === "id" ? "Batal" : "Cancel", style: "cancel" },
                            { text: language === "id" ? "Hapus" : "Remove", style: "destructive", onPress: removePhoto },
                          ]
                        );
                      }}
                      className="px-4 py-2.5 rounded-2xl"
                      style={{ backgroundColor: "#fee2e2", borderWidth: 1, borderColor: "#fca5a5" }}
                    >
                      <Text style={{ color: "#dc2626" }} className="text-xs font-bold">✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </ImageBackground>
          </View>
        </View>
        {renderSection(t(language, "theme"), (
          <>
            <View className="flex-row items-center px-4 py-4" style={{ borderBottomColor: panelBorder, borderBottomWidth: 0.5 }}>
              <View className="w-9 h-9 rounded-xl items-center justify-center mr-3" style={{ backgroundColor: iconBg }}>
                <Text className="text-base">{isDark ? "🌙" : "☀️"}</Text>
              </View>
              <Text style={{ color: colors.text }} className="flex-1 text-[15px] font-semibold">
                {isDark ? t(language, "darkMode") : t(language, "lightMode")}
              </Text>
              <Switch
                value={isDark}
                onValueChange={(v) => setTheme(v ? "dark" : "light")}
                trackColor={{ false: isDark ? "#1f2937" : "#e2e8f0", true: palette.main }}
                thumbColor="#fff"
              />
            </View>
            <View className="px-4 py-4">
              <Text style={{ color: colors.textSecondary }} className="text-xs font-semibold mb-3">
                Color Theme
              </Text>
              <View className="flex-row items-center justify-between">
                {(Object.keys(primaryPalettes) as PrimaryColor[]).map((colorKey) => {
                  const isActive = primaryColor === colorKey;
                  const cPalette = primaryPalettes[colorKey];
                  return (
                    <TouchableOpacity
                      key={colorKey}
                      onPress={() => setPrimaryColor(colorKey)}
                      className="items-center justify-center rounded-full"
                      style={{
                        width: 36,
                        height: 36,
                        backgroundColor: cPalette.main,
                        borderWidth: isActive ? 3 : 0,
                        borderColor: colors.bgCard,
                        shadowColor: isActive ? cPalette.main : "transparent",
                        shadowOpacity: isActive ? 0.4 : 0,
                        shadowRadius: 8,
                        shadowOffset: { width: 0, height: 4 },
                      }}
                    >
                      {isActive && <Text className="text-white text-sm font-bold">✓</Text>}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </>
        ))}

        {renderSection(t(language, "currency"), (
          <>
            {renderRow(
              t(language, "currency"),
              `${currencyInfo.symbol} ${currencyInfo.code}`,
              () => setShowCurrencyModal(true),
              "💱"
            )}
          </>
        ))}

        {renderSection(t(language, "manageCategories"), (
          <>
            {renderRow(
              t(language, "manageCategories"),
              "",
              () => navigation.navigate("ManageCategories"),
              "🏷️"
            )}
          </>
        ))}

        {renderSection(t(language, "language"), (
          <>
            {renderRow(
              t(language, "language"),
              LANGUAGES.find((l) => l.code === language)?.nativeName || "English",
              () => setShowLanguageModal(true),
              "🌐"
            )}
          </>
        ))}

        {/* Premium Section */}
        <View className="mx-4 mb-6">
          <Text style={{ color: colors.textSecondary }} className="text-xs font-bold uppercase tracking-widest mb-3">
            {t(language, "premium")}
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Premium")}
            activeOpacity={0.7}
            className="rounded-[28px] overflow-hidden"
            style={{
              borderWidth: isPremium ? 1.5 : 1,
              borderColor: isPremium ? palette.main : panelBorder,
              backgroundColor: isPremium ? (isDark ? palette.bgLight : palette.bgLight) : panelBg,
              shadowColor: palette.main,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.08,
              shadowRadius: 16,
              elevation: 4,
            }}
          >
            <View className="flex-row items-center px-4 py-4">
              <Text className="text-lg mr-3">👑</Text>
              <View className="flex-1">
                <Text
                  className="text-base font-bold"
                  style={{ color: isPremium ? palette.deep : colors.text }}
                >
                  {isPremium ? t(language, "premiumActiveTitle") : t(language, "unlockPremium")}
                </Text>
                <Text
                  className="text-xs mt-0.5 font-medium"
                  style={{ color: isPremium ? palette.deep : colors.textMuted }}
                >
                  {isPremium
                    ? t(language, "premiumBenefitNoAds")
                    : `Rp10.000 – Rp20.000 · ${t(language, "premiumOneTimePay")}`}
                </Text>
              </View>
              {isPremium ? (
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: palette.bgLight, borderColor: palette.soft, borderWidth: 1 }}
                >
                  <Text className="text-xs font-black" style={{ color: palette.deep }}>✓ AKTIF</Text>
                </View>
              ) : (
                <Text style={{ color: colors.textMuted }}>›</Text>
              )}
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* Currency Modal */}
      <Modal visible={showCurrencyModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: panelBg, borderColor: panelBorder, borderTopWidth: 1 }} className="rounded-t-3xl max-h-[80%]">
            <View className="flex-row justify-between items-center px-6 py-5" style={{ borderBottomColor: panelBorder, borderBottomWidth: 1 }}>
              <Text style={{ color: colors.text }} className="text-xl font-bold">{t(language, "selectCurrency")}</Text>
              <TouchableOpacity onPress={() => setShowCurrencyModal(false)}>
                <Text className="font-bold text-lg" style={{ color: palette.main }}>✕</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setCurrency(item.code); setShowCurrencyModal(false); }}
                  className="flex-row items-center px-5 py-3.5"
                  style={{ borderBottomColor: panelBorder, borderBottomWidth: 0.5 }}
                  activeOpacity={0.7}
                >
                  <View className="w-12">
                    <Text style={{ color: colors.text }} className="text-base font-bold">{item.symbol}</Text>
                  </View>
                  <View className="flex-1">
                    <Text style={{ color: colors.text }} className="text-base font-semibold">{item.name}</Text>
                    <Text style={{ color: colors.textMuted }} className="text-xs">{item.code}</Text>
                  </View>
                  {currency === item.code && <Text className="text-xl font-bold" style={{ color: palette.main }}>✓</Text>}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal visible={showLanguageModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <View style={{ backgroundColor: panelBg, borderColor: panelBorder, borderTopWidth: 1 }} className="rounded-t-3xl">
            <View className="flex-row justify-between items-center px-6 py-5" style={{ borderBottomColor: panelBorder, borderBottomWidth: 1 }}>
              <Text style={{ color: colors.text }} className="text-xl font-bold">{t(language, "selectLanguage")}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Text className="font-bold text-lg" style={{ color: palette.main }}>✕</Text>
              </TouchableOpacity>
            </View>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                onPress={() => { setLanguage(lang.code); setShowLanguageModal(false); }}
                className="flex-row items-center px-5 py-4"
                style={{ borderBottomColor: panelBorder, borderBottomWidth: 0.5 }}
                activeOpacity={0.7}
              >
                <View className="flex-1">
                  <Text style={{ color: colors.text }} className="text-base font-semibold">{lang.nativeName}</Text>
                  <Text style={{ color: colors.textMuted }} className="text-xs">{lang.name}</Text>
                </View>
                {language === lang.code && <Text className="text-xl font-bold" style={{ color: palette.main }}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Name Edit Modal */}
      <Modal visible={showNameModal} animationType="fade" transparent>
        <View className="flex-1 justify-center items-center" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <View
            style={{
              backgroundColor: panelBg,
              borderColor: panelBorder,
              borderWidth: 1,
              width: "85%",
              borderRadius: 28,
              padding: 24,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 20 },
              shadowOpacity: 0.25,
              shadowRadius: 25,
              elevation: 20,
            }}
          >
            <Text style={{ color: colors.text }} className="text-xl font-black mb-4">
              {language === "id" ? "Ubah Nama" : "Edit Name"}
            </Text>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder={language === "id" ? "Masukkan nama" : "Enter your name"}
              placeholderTextColor={colors.textMuted}
              style={{
                backgroundColor: isDark ? "#0f172a" : "#f8fafc",
                borderColor: colors.border,
                borderWidth: 1,
                color: colors.text,
                borderRadius: 16,
                paddingHorizontal: 16,
                paddingVertical: 14,
                fontSize: 16,
                fontWeight: "600",
                marginBottom: 20,
              }}
              maxLength={30}
              autoFocus
            />
            <View className="flex-row" style={{ gap: 10 }}>
              <TouchableOpacity
                onPress={() => setShowNameModal(false)}
                className="flex-1 py-3.5 items-center rounded-2xl"
                style={{ backgroundColor: isDark ? "#1f2937" : "#f1f5f9", borderWidth: 1, borderColor: colors.border }}
              >
                <Text style={{ color: colors.textSecondary }} className="font-bold">
                  {language === "id" ? "Batal" : "Cancel"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setName(editName.trim());
                  setShowNameModal(false);
                }}
                className="flex-1 py-3.5 items-center rounded-2xl"
                style={{ backgroundColor: palette.main }}
              >
                <Text className="text-white font-bold">
                  {language === "id" ? "Simpan" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Emoji Avatar Modal */}
      <Modal visible={showEmojiModal} animationType="slide" transparent>
        <View className="flex-1 justify-end" style={{ backgroundColor: "rgba(0,0,0,0.6)" }}>
          <View
            style={{
              backgroundColor: panelBg,
              borderColor: panelBorder,
              borderTopWidth: 1,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingTop: 24,
              paddingBottom: 40,
              paddingHorizontal: 20,
            }}
          >
            <View className="flex-row justify-between items-center mb-5">
              <Text style={{ color: colors.text }} className="text-xl font-black">
                {language === "id" ? "Pilih Avatar Emoji" : "Choose Emoji Avatar"}
              </Text>
              <TouchableOpacity onPress={() => setShowEmojiModal(false)}>
                <Text className="font-bold text-lg" style={{ color: palette.main }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View className="flex-row flex-wrap justify-center" style={{ gap: 8 }}>
              {EMOJI_AVATARS.map((emoji, idx) => {
                const isActive = profile.photoUri === `emoji:${emoji}`;
                return (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => {
                      setEmojiAvatar(emoji);
                      setShowEmojiModal(false);
                    }}
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 26,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isActive ? palette.main : (isDark ? "#111827" : "#f8fafc"),
                      borderWidth: isActive ? 2.5 : 1,
                      borderColor: isActive ? palette.deep : colors.border,
                    }}
                  >
                    <Text style={{ fontSize: 26 }}>{emoji}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

      {/* Photo Source Selection Modal */}
      <Modal visible={showPhotoSourceModal} animationType="fade" transparent>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowPhotoSourceModal(false)}
          className="flex-1 justify-end bg-black/60"
        >
          <View
            style={{
              backgroundColor: panelBg,
              borderColor: panelBorder,
              borderTopWidth: 1,
              borderTopLeftRadius: 32,
              borderTopRightRadius: 32,
              paddingTop: 24,
              paddingBottom: 40,
              paddingHorizontal: 20,
            }}
          >
            <View className="flex-row justify-between items-center mb-6">
              <Text style={{ color: colors.text }} className="text-xl font-black">
                {language === "id" ? "Pilih Sumber Foto" : "Choose Photo Source"}
              </Text>
              <TouchableOpacity onPress={() => setShowPhotoSourceModal(false)}>
                <Text className="font-bold text-lg" style={{ color: palette.main }}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={{ gap: 12 }}>
              <TouchableOpacity
                onPress={() => { setShowPhotoSourceModal(false); setShowEmojiModal(true); }}
                className="flex-row items-center p-4 rounded-2xl"
                style={{ backgroundColor: isDark ? "#1f2937" : "#f8fafc", borderWidth: 1, borderColor: colors.border }}
              >
                <Text className="text-2xl mr-4">😀</Text>
                <View>
                  <Text style={{ color: colors.text }} className="text-base font-bold">
                    {language === "id" ? "Gunakan Emoji" : "Use Emoji"}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-xs">
                    {language === "id" ? "Pilih dari koleksi emoji" : "Choose from emoji collection"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setShowPhotoSourceModal(false); takePhoto(); }}
                className="flex-row items-center p-4 rounded-2xl"
                style={{ backgroundColor: isDark ? "#1f2937" : "#f8fafc", borderWidth: 1, borderColor: colors.border }}
              >
                <Text className="text-2xl mr-4">📸</Text>
                <View>
                  <Text style={{ color: colors.text }} className="text-base font-bold">
                    {language === "id" ? "Ambil Foto" : "Take Photo"}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-xs">
                    {language === "id" ? "Gunakan kamera ponsel" : "Use phone camera"}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setShowPhotoSourceModal(false); pickPhoto(); }}
                className="flex-row items-center p-4 rounded-2xl"
                style={{ backgroundColor: isDark ? "#1f2937" : "#f8fafc", borderWidth: 1, borderColor: colors.border }}
              >
                <Text className="text-2xl mr-4">🖼️</Text>
                <View>
                  <Text style={{ color: colors.text }} className="text-base font-bold">
                    {language === "id" ? "Pilih dari Galeri" : "Pick from Gallery"}
                  </Text>
                  <Text style={{ color: colors.textMuted }} className="text-xs">
                    {language === "id" ? "Gunakan foto yang sudah ada" : "Use existing photo"}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
