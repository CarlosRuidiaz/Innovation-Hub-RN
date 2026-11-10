import React, { useState } from "react";

import { BottomSheet } from "@/src/core/components/BottomSheet";
import { PrimaryButton, SecondaryButton } from "@/src/core/components/Buttons";

type Props = {
  visible: boolean;
  onDismiss: () => void;
  onConfirm: () => Promise<void>;
};

// Hoja de confirmacion para retirar/cancelar una postulacion (pantalla 15 de Figma).
// Reemplaza a `withdraw_sheet.dart` usando el `BottomSheet` compartido.
export function WithdrawSheet({ visible, onDismiss, onConfirm }: Props) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onDismiss();
    } finally {
      setLoading(false);
    }
  };

  return (
    <BottomSheet
      testID={WithdrawSheet.key}
      visible={visible}
      onDismiss={onDismiss}
      title="¿Cancelar tu postulación?"
      message="Tu solicitud dejará de estar visible para el líder del proyecto. Podrás volver a postularte mientras el reclutamiento siga abierto."
    >
      <PrimaryButton
        testID={WithdrawSheet.confirmButtonKey}
        label="Sí, cancelar postulación"
        loading={loading}
        onPress={handleConfirm}
      />
      <SecondaryButton label="Volver" onPress={onDismiss} />
    </BottomSheet>
  );
}

WithdrawSheet.key = "WithdrawSheet";
WithdrawSheet.confirmButtonKey = "ButtonWithdrawConfirm";

