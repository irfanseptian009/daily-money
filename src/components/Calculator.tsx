import React, { useState, useCallback } from "react";
import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useSettings } from "../context/SettingsContext";
import { t } from "../config/translations";

interface CalculatorProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  initialValue?: string;
}

type Operator = "+" | "-" | "×" | "÷" | null;

export const Calculator: React.FC<CalculatorProps> = ({
  visible,
  onClose,
  onConfirm,
  initialValue = "",
}) => {
  const { colors, language } = useSettings();
  const [display, setDisplay] = useState(initialValue || "0");
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [operator, setOperator] = useState<Operator>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const handleNumber = useCallback((num: string) => {
    if (waitingForOperand) { setDisplay(num); setWaitingForOperand(false); } 
    else { setDisplay(display === "0" ? num : display + num); }
  }, [display, waitingForOperand]);

  const handleDecimal = useCallback(() => {
    if (waitingForOperand) { setDisplay("0."); setWaitingForOperand(false); return; }
    if (!display.includes(".")) setDisplay(display + ".");
  }, [display, waitingForOperand]);

  const calculate = useCallback((a: string, b: string, op: Operator): string => {
    const numA = parseFloat(a); const numB = parseFloat(b); let result = 0;
    switch (op) { case "+": result = numA + numB; break; case "-": result = numA - numB; break; case "×": result = numA * numB; break; case "÷": result = numB !== 0 ? numA / numB : 0; break; default: return b; }
    return parseFloat(result.toFixed(10)).toString();
  }, []);

  const handleOperator = useCallback((nextOp: Operator) => {
    if (previousValue !== null && !waitingForOperand) {
      const result = calculate(previousValue, display, operator);
      setDisplay(result); setPreviousValue(result);
    } else { setPreviousValue(display); }
    setOperator(nextOp); setWaitingForOperand(true);
  }, [display, previousValue, operator, waitingForOperand, calculate]);

  const handleEquals = useCallback(() => {
    if (previousValue !== null && operator) {
      const result = calculate(previousValue, display, operator);
      setDisplay(result); setPreviousValue(null); setOperator(null); setWaitingForOperand(false);
    }
  }, [display, previousValue, operator, calculate]);

  const handleClear = useCallback(() => { setDisplay("0"); setPreviousValue(null); setOperator(null); setWaitingForOperand(false); }, []);
  const handleBackspace = useCallback(() => { if (display.length > 1) { setDisplay(display.slice(0, -1)); } else { setDisplay("0"); } }, [display]);
  const handlePercent = useCallback(() => { const value = parseFloat(display); setDisplay((value / 100).toString()); }, [display]);
  const handleConfirm = useCallback(() => {
    const value = parseFloat(display);
    if (!isNaN(value) && value > 0) onConfirm(Math.abs(value).toString());
    handleClear();
  }, [display, onConfirm, handleClear]);

  const handleClose = useCallback(() => { handleClear(); onClose(); }, [onClose, handleClear]);

  const renderButton = (label: string, onPress: () => void, customBgColor?: string, customTextColor?: string, flex: number = 1) => (
    <TouchableOpacity onPress={onPress} activeOpacity={0.6} className="rounded-2xl items-center justify-center m-1" style={{ flex, height: 60, backgroundColor: customBgColor || colors.bgSecondary, borderColor: colors.border, borderWidth: 1 }}>
      <Text className="text-xl font-semibold" style={{ color: customTextColor || colors.text }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/50">
        <View style={{ backgroundColor: colors.bg }} className="rounded-t-3xl px-4 pb-8 pt-4">
          <View className="flex-row justify-between items-center mb-4 px-2">
            <TouchableOpacity onPress={handleClose}><Text style={{ color: colors.textSecondary }} className="text-base font-medium">{t(language, "cancel")}</Text></TouchableOpacity>
            <Text style={{ color: colors.text }} className="text-lg font-bold">{t(language, "calculator")}</Text>
            <TouchableOpacity onPress={handleConfirm}><Text className="text-income-400 text-base font-bold">{t(language, "use")}</Text></TouchableOpacity>
          </View>

          <View style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }} className="rounded-2xl px-5 py-4 mb-4">
            {previousValue && operator && (
              <Text style={{ color: colors.textMuted }} className="text-sm text-right mb-1">{previousValue} {operator}</Text>
            )}
            <Text style={{ color: colors.text }} className="text-4xl font-bold text-right" numberOfLines={1} adjustsFontSizeToFit>{display}</Text>
          </View>

          <View>
            <View className="flex-row">
              {renderButton("C", handleClear, undefined, "#ef4444")}
              {renderButton("⌫", handleBackspace)}
              {renderButton("%", handlePercent)}
              {renderButton("÷", () => handleOperator("÷"), "#10b98120", "#10b981")}
            </View>
            <View className="flex-row">
              {renderButton("7", () => handleNumber("7"))}
              {renderButton("8", () => handleNumber("8"))}
              {renderButton("9", () => handleNumber("9"))}
              {renderButton("×", () => handleOperator("×"), "#10b98120", "#10b981")}
            </View>
            <View className="flex-row">
              {renderButton("4", () => handleNumber("4"))}
              {renderButton("5", () => handleNumber("5"))}
              {renderButton("6", () => handleNumber("6"))}
              {renderButton("-", () => handleOperator("-"), "#10b98120", "#10b981")}
            </View>
            <View className="flex-row">
              {renderButton("1", () => handleNumber("1"))}
              {renderButton("2", () => handleNumber("2"))}
              {renderButton("3", () => handleNumber("3"))}
              {renderButton("+", () => handleOperator("+"), "#10b98120", "#10b981")}
            </View>
            <View className="flex-row">
              {renderButton("0", () => handleNumber("0"), undefined, undefined, 2)}
              {renderButton(".", handleDecimal)}
              {renderButton("=", handleEquals, "#10b981", "#fff")}
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
