import type { OrderFormData, FixFormData } from './types'

/**
 * Map of form field name → i18n key of the error message.
 *
 * Every field marked `required` in the UI is enforced here. Previously the
 * asterisk was decorative only: "Next" always advanced and "Submit Order"
 * always fired, so an order could be created with no client name and no
 * deadline.
 */
export type StepErrors = Record<string, string>

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

function checkClientStep(form: { client_name: string; client_email: string }): StepErrors {
  const errors: StepErrors = {}
  if (!form.client_name.trim()) errors.client_name = 'err_required'
  // Email is optional, but a typo silently breaks the order confirmation.
  if (form.client_email.trim() && !EMAIL_RE.test(form.client_email.trim())) {
    errors.client_email = 'err_email'
  }
  return errors
}

/**
 * Production wizard. Step indices follow NewOrderPage.STEPS:
 * 1 Client · 2 Product · 3 Stones · 4 Costs · 5 Review
 */
export function validateOrderStep(step: number, form: OrderFormData): StepErrors {
  const errors: StepErrors = {}

  if (step === 1) {
    return checkClientStep(form)
  }

  if (step === 2) {
    if (!form.jewelry_type) errors.jewelry_type = 'err_required'
    if (!form.metal) errors.metal = 'err_required'
    if (form.jewelry_type === 'other' && !form.other_type.trim()) errors.other_type = 'err_required'

    // Measurement fields the sizer components mark `required`.
    if (form.jewelry_type === 'ring' || form.jewelry_type === 'eternity') {
      if (!form.size) errors.size = 'err_required'
    }
    if (form.jewelry_type === 'earrings' && !form.earring_sub_type) {
      errors.earring_sub_type = 'err_required'
    }
    if (form.jewelry_type === 'pendant' && !form.pendant_length_cm) {
      errors.pendant_length_cm = 'err_required'
    }
    if (form.jewelry_type === 'bracelet') {
      if (!form.bracelet_sub_type) {
        errors.bracelet_sub_type = 'err_required'
      } else if (form.bracelet_sub_type === 'bangle') {
        if (!form.bangle_size_cm) errors.bangle_size_cm = 'err_required'
      } else if (!form.size) {
        errors.size = 'err_required'
      }
    }
    return errors
  }

  if (step === 3) {
    // Prong type is only shown — and only required — for rings and eternity bands.
    if ((form.jewelry_type === 'ring' || form.jewelry_type === 'eternity') && !form.cat_claw) {
      errors.cat_claw = 'err_required'
    }
    return errors
  }

  if (step === 4) {
    if (!form.certificate) errors.certificate = 'err_required'
    if (!form.order_purpose) errors.order_purpose = 'err_required'
    if (!form.deadline) errors.deadline = 'err_required'
    if (form.advance_amount && parseFloat(form.advance_amount) > 0 && !form.advance_method) {
      errors.advance_method = 'err_required'
    }
    if (form.price_to_client && parseFloat(form.price_to_client) < 0) {
      errors.price_to_client = 'err_positive'
    }
    if (form.advance_amount && parseFloat(form.advance_amount) < 0) {
      errors.advance_amount = 'err_positive'
    }
    return errors
  }

  return errors
}

/** Every rule across every step — the gate for the final Submit. */
export function validateOrderAll(form: OrderFormData): StepErrors {
  return {
    ...validateOrderStep(1, form),
    ...validateOrderStep(2, form),
    ...validateOrderStep(3, form),
    ...validateOrderStep(4, form),
  }
}

/**
 * Fix wizard. Step indices follow FixOrderPage.STEPS:
 * 1 Client · 2 Fix info · 3 Review
 */
export function validateFixStep(step: number, form: FixFormData): StepErrors {
  const errors: StepErrors = {}

  if (step === 1) {
    return checkClientStep(form)
  }

  if (step === 2) {
    if (!form.jewelry_type) errors.jewelry_type = 'err_required'
    if (form.fix_options.length === 0) errors.fix_options = 'err_pick_one'
    if (form.fix_options.includes('other') && !form.fix_other_text.trim()) {
      errors.fix_other_text = 'err_required'
    }
    if (form.fix_options.includes('resize') && !form.size.trim()) {
      errors.size = 'err_required'
    }
    if (form.price_to_client && parseFloat(form.price_to_client) < 0) {
      errors.price_to_client = 'err_positive'
    }
    return errors
  }

  return errors
}

export function validateFixAll(form: FixFormData): StepErrors {
  return {
    ...validateFixStep(1, form),
    ...validateFixStep(2, form),
  }
}

export function hasErrors(errors: StepErrors): boolean {
  return Object.keys(errors).length > 0
}
