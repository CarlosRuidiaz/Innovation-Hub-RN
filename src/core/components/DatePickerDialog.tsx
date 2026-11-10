import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";

import { AppColors, AppTokens, AppTypography } from "@/src/theme/tokens";

// El calendario para elegir un dia: el `showDatePicker` de Flutter, que abre
// un dialogo con la vista de un mes, flechas para cambiar de mes y "Cancelar"
// / "Aceptar". Los dias fuera de `firstDate`..`lastDate` no se pueden tocar.
//
// No hay un selector de fecha en las dependencias, y el nativo no funciona en
// el navegador: este se ve igual en Android y en la web. Lo usan los hitos del
// espacio de trabajo y el cierre de una encuesta.
type Props = {
  visible: boolean;
  initialDate: Date;
  firstDate: Date;
  lastDate: Date;
  onConfirm: (date: Date) => void;
  onDismiss: () => void;
};

const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];
const WEEK_DAYS = ["L", "M", "M", "J", "V", "S", "D"];
const SHORT_DAYS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

// Solo el dia: la hora no cuenta al comparar ni al devolver la fecha.
const dayOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) => dayOf(a).getTime() === dayOf(b).getTime();

export function DatePickerDialog({ visible, initialDate, firstDate, lastDate, onConfirm, onDismiss }: Props) {
  const [selected, setSelected] = useState(dayOf(initialDate));
  const [month, setMonth] = useState(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));

  const [today] = useState(() => dayOf(new Date()));

  // Cada vez que se abre arranca en la fecha que le pasan, como en Flutter.
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setSelected(dayOf(initialDate));
      setMonth(new Date(initialDate.getFullYear(), initialDate.getMonth(), 1));
    }
  }

  const first = dayOf(firstDate);
  const last = dayOf(lastDate);

  const firstOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  // Las semanas empiezan el lunes.
  const offset = (firstOfMonth.getDay() + 6) % 7;
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = Array.from({ length: cells.length / 7 }, (_, i) => cells.slice(i * 7, i * 7 + 7));

  const canGoBack = new Date(month.getFullYear(), month.getMonth(), 0).getTime() >= first.getTime();
  const canGoForward = new Date(month.getFullYear(), month.getMonth() + 1, 1).getTime() <= last.getTime();
  const shift = (delta: number) => setMonth(new Date(month.getFullYear(), month.getMonth() + delta, 1));

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.root}>
        <Pressable style={[StyleSheet.absoluteFill, styles.backdrop]} onPress={onDismiss} accessibilityLabel="Cerrar" />
        <View testID={DatePickerDialog.key} style={styles.dialog}>
          <Text style={styles.helper}>Seleccionar fecha</Text>
          <Text style={styles.headline}>
            {`${SHORT_DAYS[selected.getDay()]}, ${selected.getDate()} de ${MONTHS[selected.getMonth()]}`}
          </Text>
          <View style={styles.divider} />

          <View style={styles.monthRow}>
            <Text style={styles.monthLabel}>{`${MONTHS[month.getMonth()]} de ${month.getFullYear()}`}</Text>
            <View style={styles.arrows}>
              <Pressable
                testID={DatePickerDialog.previousMonthKey}
                accessibilityRole="button"
                accessibilityLabel="Mes anterior"
                disabled={!canGoBack}
                onPress={() => shift(-1)}
                hitSlop={AppTokens.gapS}
              >
                <MaterialIcons
                  name="chevron-left"
                  size={AppTokens.iconSize}
                  color={canGoBack ? AppColors.ink : AppColors.disabledText}
                />
              </Pressable>
              <Pressable
                testID={DatePickerDialog.nextMonthKey}
                accessibilityRole="button"
                accessibilityLabel="Mes siguiente"
                disabled={!canGoForward}
                onPress={() => shift(1)}
                hitSlop={AppTokens.gapS}
              >
                <MaterialIcons
                  name="chevron-right"
                  size={AppTokens.iconSize}
                  color={canGoForward ? AppColors.ink : AppColors.disabledText}
                />
              </Pressable>
            </View>
          </View>

          <View style={styles.week}>
            {WEEK_DAYS.map((d, i) => (
              <Text key={`${d}${i}`} style={[styles.cell, styles.weekDay]}>
                {d}
              </Text>
            ))}
          </View>
          {weeks.map((week, w) => (
            <View key={w} style={styles.week}>
              {week.map((day, i) => {
                if (day == null) return <View key={i} style={styles.cell} />;
                const enabled = day.getTime() >= first.getTime() && day.getTime() <= last.getTime();
                const isSelected = sameDay(day, selected);
                const isToday = sameDay(day, today);
                return (
                  <Pressable
                    key={i}
                    testID={DatePickerDialog.dayKey(day.getDate())}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: !enabled, selected: isSelected }}
                    disabled={!enabled}
                    onPress={() => setSelected(day)}
                    style={[
                      styles.cell,
                      styles.day,
                      isToday && !isSelected ? styles.today : null,
                      isSelected ? styles.selected : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayLabel,
                        !enabled ? styles.dayDisabled : null,
                        isToday && !isSelected ? styles.todayLabel : null,
                        isSelected ? styles.selectedLabel : null,
                      ]}
                    >
                      {day.getDate()}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}

          <View style={styles.actions}>
            <Button testID={DatePickerDialog.cancelKey} mode="text" onPress={onDismiss}>
              Cancelar
            </Button>
            <Button testID={DatePickerDialog.confirmKey} mode="text" onPress={() => onConfirm(selected)}>
              Aceptar
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
}

DatePickerDialog.key = "DatePickerDialog";
DatePickerDialog.previousMonthKey = "DatePickerDialog.previousMonth";
DatePickerDialog.nextMonthKey = "DatePickerDialog.nextMonth";
DatePickerDialog.cancelKey = "DatePickerDialog.cancel";
DatePickerDialog.confirmKey = "DatePickerDialog.confirm";
DatePickerDialog.dayKey = (day: number) => `DatePickerDialog.day.${day}`;

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: "center", justifyContent: "center", padding: AppTokens.gapXl },
  backdrop: { backgroundColor: AppColors.backdrop },
  dialog: {
    backgroundColor: AppColors.card,
    borderColor: AppColors.ink,
    borderWidth: AppTokens.borderWidth,
    borderRadius: AppTokens.sheetRadius,
    paddingHorizontal: AppTokens.gapM,
    paddingTop: AppTokens.gapL,
    paddingBottom: AppTokens.gapS,
  },
  helper: { ...AppTypography.labelLarge, color: AppColors.secondary, paddingHorizontal: AppTokens.gapS },
  headline: { ...AppTypography.headlineMedium, paddingHorizontal: AppTokens.gapS, marginTop: AppTokens.gapS },
  divider: { height: AppTokens.borderWidth, backgroundColor: AppColors.ink, marginVertical: AppTokens.gapM },
  monthRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: AppTokens.gapS,
    marginBottom: AppTokens.gapS,
  },
  monthLabel: AppTypography.labelLarge,
  arrows: { flexDirection: "row", gap: AppTokens.gapL },
  week: { flexDirection: "row" },
  cell: {
    width: AppTokens.calendarDaySize,
    height: AppTokens.calendarDaySize,
    textAlign: "center",
    textAlignVertical: "center",
  },
  weekDay: { ...AppTypography.bodySmall, lineHeight: AppTokens.calendarDaySize },
  day: { alignItems: "center", justifyContent: "center", borderRadius: AppTokens.pillRadius },
  today: { borderWidth: AppTokens.borderWidth, borderColor: AppColors.persimmon },
  selected: { backgroundColor: AppColors.persimmon },
  dayLabel: AppTypography.bodyMedium,
  dayDisabled: { color: AppColors.disabledText },
  todayLabel: { color: AppColors.persimmon },
  selectedLabel: { color: AppColors.white },
  actions: { flexDirection: "row", justifyContent: "flex-end", marginTop: AppTokens.gapS },
});
