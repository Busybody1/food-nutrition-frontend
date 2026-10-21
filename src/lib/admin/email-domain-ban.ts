export interface EmailDomainBanGate {
  locks_out_actor: boolean
  requires_large_confirm: boolean
}

export function emailDomainBanNeedsConfirm(
  preview: EmailDomainBanGate,
  allowSelfLockout: boolean,
  confirmLarge: boolean,
): boolean {
  return (
    (preview.locks_out_actor && !allowSelfLockout) ||
    (preview.requires_large_confirm && !confirmLarge)
  )
}

export function emailDomainBanSavesOnSubmit(
  preview: EmailDomainBanGate,
  allowSelfLockout: boolean,
  confirmLarge: boolean,
): boolean {
  return !emailDomainBanNeedsConfirm(preview, allowSelfLockout, confirmLarge)
}
